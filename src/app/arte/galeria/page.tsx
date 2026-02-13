// src/app/arte/galeria/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";
import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};


/** Cover helper para works */
function pickCover(media: any[]) {
  return (media?.find((m: any) => m.isCover) ?? media?.[0]) ?? null;
}

/** Mini helper “tag OR slug/name” */
function tagOr(slugsOrNames: string[]) {
  return {
    OR: slugsOrNames.flatMap((t) => [{ slug: t }, { name: t }]),
  };
}

function toStr(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function toInt(v: string | string[] | undefined, fallback: number) {
  const raw = toStr(v);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function buildHref(base: string, params: Record<string, string | null>) {
  const sp = new URLSearchParams();
  for (const [k, val] of Object.entries(params)) {
    if (val && val.trim()) sp.set(k, val);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function filterLabel(filter: string) {
  switch (filter) {
    case "photo":
      return "Foto";
    case "prints":
      return "Láminas";
    case "process":
      return "Proceso";
    default:
      return "Todo";
  }
}

/* =========================================================
   SEO / IA / Arquitectura global
   - Canonical: /arte/galeria (sin querystring)
   - OG/Twitter: listos para enchufar imágenes cuando tengas OG route
========================================================= */

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/arte/galeria");

  const title = "Galería · Arte & Photo";
  const description =
    "Galería de piezas, fotos y procesos. Filtra por intención: foto, láminas o proceso.";

  return {
    title,
    description,
    alternates: { canonical },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: "Galería · Arte & Photo · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/arte-galeria.jpg"),
      //     width: 1200,
      //     height: 630,
      //     alt: "Galería · Arte & Photo · elvasco.x",
      //   },
      // ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Galería · Arte & Photo · elvasco.x",
      description,
      // images: [siteUrl("/og/arte-galeria.jpg")],
    },

    keywords: [
      "elvasco.x",
      "galería",
      "galeria",
      "arte",
      "art",
      "fotografía",
      "fotografia",
      "photography",
      "prints",
      "láminas",
      "laminas",
      "proceso",
      "process",
      "abstract",
      "abstracto",
      "studio",
      "sketch",
      "canvas",
      "cuadro",
    ],
  };
}

export default async function ArteGaleriaPage({ searchParams }: PageProps) {
  const spRaw = (await searchParams) ?? {};
  const q = (toStr(spRaw.q) ?? "").trim();
  const filter = (toStr(spRaw.f) ?? "all").toLowerCase(); // all | photo | prints | process
  const page = toInt(spRaw.p, 1);

  const TAKE = 24;
  const skip = (page - 1) * TAKE;

  const navItems = [
    { href: "#filtros", label: "Filtros" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Contacto" },
  ];

  // Tags “base” de arte/foto/proceso
  const baseTags = [
    "arte",
    "art",
    "photo",
    "fotografia",
    "photography",
    "abstract",
    "abstracto",
    "print",
    "lamina",
    "process",
    "proceso",
    "studio",
    "boceto",
    "sketch",
    "canvas",
    "cuadro",
  ];

  // Filtros “por estética” (tags)
  const filterTags =
    filter === "photo"
      ? ["photo", "fotografia", "photography"]
      : filter === "prints"
        ? ["print", "lamina", "lámina", "poster"]
        : filter === "process"
          ? ["process", "proceso", "studio", "taller", "makingof"]
          : null;

  // ✅ Base robusta:
  // - Si es tipo ART, entra aunque aún no tenga tags.
  // - Si no es ART, entra si tiene tags base (por si algún día usas type JOURNAL con tags art/process).
  const where = {
    status: "PUBLISHED" as const,
    AND: [
      {
        OR: [
          { type: "ART" as const },
          {
            tags: {
              some: {
                tag: tagOr(baseTags),
              },
            },
          },
        ],
      },

      // Filtro opcional (tags)
      ...(filterTags
        ? [
            {
              tags: {
                some: {
                  tag: tagOr(filterTags),
                },
              },
            },
          ]
        : []),

      // Search simple (title/excerpt/content)
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q } },
                { excerpt: { contains: q } },
                { content: { contains: q } },
              ],
            },
          ]
        : []),
    ],
  };

  const [items, total] = await Promise.all([
    prisma.work.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: TAKE,
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
            id: true,
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

  const totalPages = Math.max(1, Math.ceil(total / TAKE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const base = "/arte/galeria";
  const commonParams = { q: q || null, f: filter || "all" };

  const pills = [
    { key: "all", label: "Todo" },
    { key: "photo", label: "Foto" },
    { key: "prints", label: "Láminas" },
    { key: "process", label: "Proceso" },
  ];

  /* =========================================================
     JSON-LD: Breadcrumb + CollectionPage + ItemList + Person
     - Canonical: /arte/galeria (sin querystring)
     - Indicamos el estado de filtros/paginación en texto (no canonical)
  ========================================================= */

  const canonical = siteUrl("/arte/galeria");
  const viewUrl = siteUrl(buildHref(base, { q: q || null, f: filter !== "all" ? filter : null, p: page > 1 ? String(page) : null }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Arte", item: siteUrl("/arte") },
          { "@type": "ListItem", position: 3, name: "Galería", item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Galería · Arte & Photo · elvasco.x",
        url: canonical,
        description:
          "Galería de piezas, fotos y procesos. Filtra por intención: foto, láminas o proceso.",
        isPartOf: {
          "@type": "WebSite",
          name: "elvasco.x",
          url: siteUrl("/"),
        },
        about: [
          { "@type": "Thing", name: "Art gallery" },
          { "@type": "Thing", name: "Photography" },
          { "@type": "Thing", name: "Printmaking" },
          { "@type": "Thing", name: "Creative process" },
        ],
        // View actual (con filtros/página) para que LLMs entiendan el estado, sin tocar canonical.
        mainEntity: {
          "@type": "ItemList",
          name: `Galería (${filterLabel(filter)}) · elvasco.x`,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: items.length,
          url: viewUrl,
          itemListElement: items.map((w, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: w.title,
            url: w.slug ? siteUrl(`/work/${w.slug}`) : canonical,
          })),
        },
      },
      {
        "@type": "Person",
        name: "El Vasco",
        url: siteUrl("/bio"),
        sameAs: ["https://www.instagram.com/elvasco.x", "https://youtube.com/@elvasco.x"],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/arte" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Arte
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Galería</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              GALER
              <span className="text-red-500">Í</span>A
            </span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              ARTE &amp; PHOTO
            </span>
          </span>
        }
        subtitle={
          <span>
            Piezas, fotos y procesos. Selecciona por intención, no por etiqueta.
            <span className="text-red-500"> </span>
            Aquí lo “bonito” no manda: manda lo real.
          </span>
        }
      />

      <AnchorNav items={navItems} />

      {/* FILTROS */}
      <section id="filtros" className="scroll-mt-24 space-y-4">
        <SectionHeading
          id="filtros"
          title="Filtros"
          desc="Rápido y al grano: todo / foto / láminas / proceso. (Luego metemos filtros finos con tags reales)."
        />


        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {pills.map((p) => {
              const active = filter === p.key || (p.key === "all" && filter === "all");
              return (
                <Link
                  key={p.key}
                  href={buildHref(base, { q: q || null, f: p.key, p: "1" })}
                  className={
                    active
                      ? "rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-sm text-zinc-100"
                      : "rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-sm text-zinc-300 hover:border-zinc-600 transition"
                  }
                >
                  {p.label}
                </Link>
              );
            })}
          </div>

          {/* Search “server” (sin JS). */}
          <form action={base} method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input type="hidden" name="f" value={filter} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por título o nota…"
              className="w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              className="rounded-xl border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
            >
              Buscar
            </button>

            {(q || filter !== "all") && (
              <Link
                href={base}
                className="rounded-xl border border-zinc-800 bg-black/10 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition"
              >
                Limpiar
              </Link>
            )}
          </form>

          <div className="text-xs text-zinc-500">
            Mostrando {items.length} de {total} · página {page} / {totalPages}
          </div>
        </div>
      </section>

      {/* GALERIA GRID */}
      <section id="galeria" className="scroll-mt-24 space-y-4">
          <SectionHeading
            id="galeria"
            title="Galería"
            desc="Últimos publicados. Si hay cover, manda. Si no, a pelo."
          />


        {items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? []).slice(0, 3).map((t) => t.tag.name);

              return (
                <Link
                  key={w.id}
                  href={`/work/${w.slug}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/30 hover:border-zinc-600 transition"
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      <MediaRenderer media={cover as any} className="h-full w-full" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-4 bottom-3 right-4">
                        <div className="text-xs uppercase tracking-wide text-zinc-400">{w.type}</div>
                        <div className="mt-1 text-sm font-semibold text-zinc-100 leading-tight line-clamp-2">
                          {w.title}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute left-4 bottom-3 right-4">
                        <div className="text-xs uppercase tracking-wide text-zinc-400">{w.type}</div>
                        <div className="mt-1 text-sm font-semibold text-zinc-100 leading-tight line-clamp-2">
                          {w.title}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    {w.excerpt ? <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p> : null}

                    <div className="pt-1 flex flex-wrap gap-2">
                      {tagNames.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                        elvasco.x
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 text-zinc-400">
            No hay resultados con estos filtros. Prueba con “Todo” o limpia la búsqueda.
          </div>
        )}

        {/* Paginación */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            {hasPrev ? (
              <Link
                href={buildHref(base, { ...commonParams, p: String(page - 1) })}
                className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="rounded-full border border-zinc-900 px-4 py-2 text-sm text-zinc-600">
                ← Anterior
              </span>
            )}
          </div>

          <div className="text-xs text-zinc-500">
            Página {page} / {totalPages}
          </div>

          <div>
            {hasNext ? (
              <Link
                href={buildHref(base, { ...commonParams, p: String(page + 1) })}
                className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="rounded-full border border-zinc-900 px-4 py-2 text-sm text-zinc-600">
                Siguiente →
              </span>
            )}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto"
          desc="Encargos, prints, licencias, sesiones de foto/vídeo o piezas a medida. Si te vibra este universo: escríbeme."
          primaryHref="/contacto"
          primaryLabel="Contacto"
          secondaryHref="https://www.instagram.com/elvasco.x"
          secondaryLabel="Instagram"
          aside={
            <div className="space-y-3">
              <div className="text-sm text-zinc-400">
                <span className="text-zinc-200 font-semibold">elvasco</span>
                <span className="text-red-500">.</span>
                <span className="text-red-500">x</span>
                <span className="text-zinc-600"> · </span>
                <span className="text-zinc-500">Underground by choice</span>
                <span className="text-red-500"> ✖️</span>
              </div>

              <div className="text-xs text-zinc-500">Redes:</div>

              <div className="flex flex-col gap-2 text-sm">
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://www.instagram.com/elvasco.x"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://youtube.com/@elvasco.x"
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </a>
              </div>
            </div>
          }
        />
      </section>
    </main>
  );
}
