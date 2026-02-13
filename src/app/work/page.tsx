import MediaRenderer from "@/components/MediaRenderer";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { WorkType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

type SP = Promise<{ type?: string; page?: string }>;


const TYPE_LABEL: Record<string, string> = {
  ALL: "Todo",
  TATTOO: "Tattoo",
  ART: "Arte",
  FILM: "Film",
  MUSIC: "Música",
  DEV: "Dev",
  JOURNAL: "Journal",
};

const TYPES: Array<keyof typeof TYPE_LABEL> = [
  "ALL",
  "TATTOO",
  "ART",
  "FILM",
  "MUSIC",
  "DEV",
  "JOURNAL",
];

function toInt(v: string | undefined, fallback: number) {
  const n = Number(v ?? "");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

function formatDate(d?: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return null;
  }
}

function normalizeType(raw?: string): "ALL" | WorkType {
  const typeRaw = (raw ?? "ALL").toUpperCase();
  const safe = (TYPES.includes(typeRaw as any)
    ? typeRaw
    : "ALL") as "ALL" | WorkType;
  return safe;
}

function buildCanonical(type: "ALL" | WorkType) {
  return type === "ALL"
    ? siteUrl("/work")
    : siteUrl(`/work?type=${type}`);
}

/* =========================
   SEO / METADATA (AÑADIDO)
   ========================= */

function buildMeta(
  type: "ALL" | WorkType,
  page: number
): Pick<Metadata, "title" | "description" | "alternates" | "openGraph" | "twitter" | "robots"> {

  const label =
    TYPE_LABEL[type === "ALL" ? "ALL" : (type as any)] ?? "Todo";

  const title =
    type === "ALL"
      ? "Archivo · elvasco.x"
      : `Archivo · ${label} · elvasco.x`;

  const description =
    type === "ALL"
      ? "Archivo transversal de piezas publicadas: tattoo, arte, film, música, dev y journal."
      : `Archivo de piezas publicadas en ${label}: tattoo, arte, film, música, dev y journal.`;

  const canonical = buildCanonical(type);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "elvasco.x",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: page <= 1,
      follow: true,
    },

  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SP;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};

  const type = normalizeType(sp.type);
  const page = toInt(sp.page, 1);
  return buildMeta(type, page);
}

export default async function WorkIndexPage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  const sp = (await searchParams) ?? {};


  const type = normalizeType(sp.type);
  const typeRaw = (sp.type ?? "ALL").toUpperCase();
  const page = toInt(sp.page, 1);

  const PAGE_SIZE = 12;
  const skip = (page - 1) * PAGE_SIZE;

  const where =
    type === "ALL"
      ? { status: "PUBLISHED" as const }
      : { status: "PUBLISHED" as const, type };

  const [items, total] = await Promise.all([
    prisma.work.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        type: true,
        publishedAt: true,
        tags: { include: { tag: true } },
        media: {
          orderBy: { order: "asc" },
          take: 3,
          select: {
            kind: true,
            url: true,
            alt: true,
            width: true,
            height: true,
            isCover: true,
            order: true,
          },
        },
      },
    }),
    prisma.work.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < pages;

  const baseTypeQS = type === "ALL" ? "" : `type=${type}`;
  const activeLabel =
    TYPE_LABEL[type === "ALL" ? "ALL" : (type as any)] ?? "Todo";

  const canonical = buildCanonical(type);

  /* =========================
     JSON-LD (AÑADIDO)
     ========================= */

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      type === "ALL"
        ? "Archivo — elvasco.x"
        : `Archivo · ${activeLabel} — elvasco.x`,
    url: canonical,
    description:
      type === "ALL"
        ? "Archivo transversal de piezas publicadas: tattoo, arte, film, música, dev y journal."
        : `Archivo de piezas publicadas en ${activeLabel}.`,
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Archivo",
        item: siteUrl("/work"),
      },
      ...(type !== "ALL"
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: activeLabel,
              item: canonical,
            },
          ]
        : []),
    ],
  };

  const topPills = [
    { label: "Home", href: "/" },
    { label: "Bio", href: "/bio" },
    { label: "Archivo", href: "/work" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbsJsonLd),
        }}
      />

      {/* HEADER */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              Archivo transversal
            </div>

            <h1 className="leading-[0.9]">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                WORK<span className="text-red-500">.</span>
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-500">
                ARCHIVE
              </span>
            </h1>

            <p className="text-zinc-400 max-w-2xl leading-relaxed">
              Piezas publicadas: tattoo, arte, film, música, dev y journal.
              Todo vive en el mismo sistema. Sin carpetas mentales.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {topPills.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="text-xs rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-zinc-300 hover:border-zinc-600 transition"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {/* FILTROS */}
        <section className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = t === typeRaw || (t === "ALL" && type === "ALL");
            const href = t === "ALL" ? "/work" : `/work?type=${t}`;

            return (
              <Link
                key={t}
                href={href}
                className={[
                  "text-sm rounded-full border px-3 py-1 transition bg-black/20",
                  active
                    ? "border-zinc-600 text-zinc-100"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                ].join(" ")}
              >
                {TYPE_LABEL[t]}
                {active ? <span className="text-red-500"> ✖</span> : null}
              </Link>
            );
          })}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-zinc-500">
            Mostrando{" "}
            <span className="text-zinc-300 font-medium">{activeLabel}</span> ·{" "}
            {total} piezas
          </div>
          <div className="text-xs text-zinc-600">
            Orden: publishedAt desc → createdAt desc
          </div>
        </div>
      </header>

      {/* GRID */}
      {items.length ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w) => {
            const cover = pickCover(w.media as any[]);
            const tagNames = (w.tags ?? []).slice(0, 3).map((t) => t.tag.name);
            const dateLabel = formatDate(w.publishedAt);

            return (
              <Link
                key={w.id}
                href={`/work/${w.slug}`}
                className="group rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition relative"
              >
                {cover ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                    <MediaRenderer media={cover as any} className="h-full w-full" />
                  </div>
                ) : (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" />
                )}

                <div className="mt-3 space-y-1">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    {w.type}
                    {dateLabel ? (
                      <span className="text-zinc-600"> · {dateLabel}</span>
                    ) : null}
                  </div>

                  <div className="font-semibold leading-tight">
                    {w.title}
                  </div>

                  {w.excerpt ? (
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {w.excerpt}
                    </p>
                  ) : null}

                  {tagNames.length ? (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {tagNames.map((t) => (
                        <span
                          key={t}
                          className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <div className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400 bg-black/30">
          No hay piezas publicadas en este filtro.
        </div>
      )}

      {/* PAGINACIÓN */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
        <div className="text-zinc-500">
          Página {page} / {pages}
        </div>

        <div className="flex gap-2">
          {hasPrev ? (
            <Link
              href={`/work?${baseTypeQS}${baseTypeQS ? "&" : ""}page=${page - 1}`}
              className="rounded-lg border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-zinc-600 transition"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="rounded-lg border border-zinc-900 px-3 py-1 text-zinc-700">
              ← Anterior
            </span>
          )}

          {hasNext ? (
            <Link
              href={`/work?${baseTypeQS}${baseTypeQS ? "&" : ""}page=${page + 1}`}
              className="rounded-lg border border-zinc-800 px-3 py-1 text-zinc-300 hover:border-zinc-600 transition"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="rounded-lg border border-zinc-900 px-3 py-1 text-zinc-700">
              Siguiente →
            </span>
          )}
        </div>
      </footer>
    </main>
  );
}
