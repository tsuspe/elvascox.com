// src/app/work/[slug]/page.tsx
import WorkCoverPosterClient from "@/components/WorkCoverPosterClient";
import WorkGallery from "@/components/WorkGallery";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;


type Props = {
  params?: Promise<{ slug: string }>;
};


function formatDate(d?: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("es-ES");
  } catch {
    return null;
  }
}

type MediaLite = {
  kind: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  isCover: boolean;
  order: number;
};

function pickCover(media: MediaLite[] | undefined) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

function hasTag(workTags: Array<{ tag: { slug: string } }>, slug: string) {
  return workTags?.some((t) => (t.tag?.slug ?? "").toLowerCase() === slug.toLowerCase());
}

/**
 * Parent “semántico” para breadcrumbs / isPartOf.
 * - prioridad por tags (sub-verticales)
 * - fallback por type
 */
function resolveParent(args: { type: string; tagSlugs: string[] }) {
  const type = String(args.type || "").toUpperCase();
  const tags = (args.tagSlugs ?? []).map((s) => String(s).toLowerCase());

  // Música → sub-verticales
  if (type === "MUSIC") {
    if (tags.includes("techno") || tags.includes("303") || tags.includes("acid")) {
      return { name: "Música", url: siteUrl("/musica"), sub: { name: "Techno", url: siteUrl("/musica/techno") } };
    }
    return { name: "Música", url: siteUrl("/musica") };
  }

  // Arte / Foto / Proceso
  if (type === "ART") {
    return { name: "Arte", url: siteUrl("/arte"), sub: { name: "Galería", url: siteUrl("/arte/galeria") } };
  }

  // Tattoo
  if (type === "TATTOO") {
    return { name: "Tattoo", url: siteUrl("/tattoo") };
  }

  // Film
  if (type === "FILM" || type === "VIDEO") {
    return { name: "Film", url: siteUrl("/film") };
  }

  // Dev / Creative Dev
  if (type === "DEV" || type === "PROJECT") {
    return { name: "Creative Dev", url: siteUrl("/dev") };
  }

  // Fallback: Archivo
  return { name: "Archivo", url: siteUrl("/work") };
}

function buildJsonLdGraph(args: {
  slug: string;
  title: string;
  excerpt?: string | null;
  type: string;
  tagNames: string[];
  tagSlugs: string[];
  cover?: MediaLite | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
}) {
  const url = siteUrl(`/work/${args.slug}`);
  const parent = resolveParent({ type: args.type, tagSlugs: args.tagSlugs });

  const author = {
    "@type": "Person",
    name: "El Vasco",
    url: siteUrl("/bio"),
    sameAs: ["https://www.instagram.com/elvasco.x", "https://youtube.com/@elvasco.x"],
  };

  const breadcrumbItems: Array<{ name: string; item: string }> = [
    { name: "Home", item: siteUrl("/") },
    { name: "Archivo", item: siteUrl("/work") },
  ];

  // Si hay parent/sub, lo metemos entre Archivo y la pieza
  if (parent?.name && parent?.url && parent.url !== siteUrl("/work")) {
    breadcrumbItems.push({ name: parent.name, item: parent.url });
  }
  if ((parent as any)?.sub?.name && (parent as any)?.sub?.url) {
    breadcrumbItems.push({ name: (parent as any).sub.name, item: (parent as any).sub.url });
  }

  breadcrumbItems.push({ name: args.title, item: url });

  const coverUrl = args.cover?.url ? String(args.cover.url) : null;

  const creativeWork: any = {
    "@type": "CreativeWork",
    "@id": url,
    url,
    name: args.title,
    headline: args.title,
    description: args.excerpt ?? undefined,
    author,
    creator: author,
    genre: String(args.type),
    keywords: args.tagNames?.length ? args.tagNames.join(", ") : undefined,
    datePublished: args.publishedAt ? args.publishedAt.toISOString() : undefined,
    dateModified: args.updatedAt ? args.updatedAt.toISOString() : undefined,
    inLanguage: "es-ES",
    isPartOf: {
      "@type": "CollectionPage",
      name: "Archivo · elvasco.x",
      url: siteUrl("/work"),
    },
  };

  if (coverUrl) {
    creativeWork.image = [
      {
        "@type": "ImageObject",
        url: coverUrl,
        width: args.cover?.width ?? undefined,
        height: args.cover?.height ?? undefined,
        caption: args.cover?.alt ?? undefined,
      },
    ];
  }

  // WebPage (útil para crawlers/LLMs; enlaza al CreativeWork)
  const webPage: any = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: args.title,
    description: args.excerpt ?? undefined,
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    primaryImageOfPage: coverUrl
      ? {
          "@type": "ImageObject",
          url: coverUrl,
          width: args.cover?.width ?? undefined,
          height: args.cover?.height ?? undefined,
        }
      : undefined,
    mainEntity: { "@id": url },
    inLanguage: "es-ES",
  };

  // BreadcrumbList
  const breadcrumb: any = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.item,
    })),
  };

  // Limpieza undefined
  const clean = (obj: any) => {
    if (!obj || typeof obj !== "object") return obj;
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (v === undefined || v === null) delete obj[k];
      else if (typeof v === "object") clean(v);
    });
    return obj;
  };

  clean(creativeWork);
  clean(webPage);
  clean(breadcrumb);

  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumb, webPage, creativeWork, author],
  };
}

/**
 * SEO por pieza (title, description, canonical, OG)
 * - Sólo indexamos PUBLISHED
 */
export async function generateMetadata({
  params,
}: {
  params?: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = (await params) ?? {};

  if (!slug || typeof slug !== "string") return {};

  const work = await prisma.work.findUnique({
    where: { slug },
    select: {
      status: true,
      slug: true,
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      publishedAt: true,
      createdAt: true,
      media: {
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true, alt: true, isCover: true, order: true, kind: true, width: true, height: true },
      },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      type: true,
    },
  });

  if (!work) return {};

  const isPublished = work.status === "PUBLISHED";
  const canonical = siteUrl(`/work/${work.slug}`);

  const cover = pickCover(
    (work.media ?? []).map((m) => ({
      kind: m.kind,
      url: m.url,
      alt: m.alt ?? null,
      width: m.width ?? null,
      height: m.height ?? null,
      isCover: m.isCover ?? false,
      order: m.order ?? 0,
    }))
  );

  const title = work.seoTitle ?? work.title;
  const description =
    work.seoDescription ??
    work.excerpt ??
    `Pieza del archivo elvasco.x · ${String(work.type)}`;

  const tagNames = (work.tags ?? []).map((t) => t.tag.name).filter(Boolean);
  const tagSlugs = (work.tags ?? []).map((t) => t.tag.slug).filter(Boolean);

  // Keywords guía (sin stuffing)
  const keywords = [
    "elvasco.x",
    "archivo",
    "work",
    String(work.type).toLowerCase(),
    ...tagNames.slice(0, 12),
    ...tagSlugs.slice(0, 12),
  ].filter(Boolean);

  const images = cover?.url
    ? [
        {
          url: cover.url,
          alt: cover.alt ?? work.title,
          width: cover.width ?? undefined,
          height: cover.height ?? undefined,
        },
      ]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },

    robots: isPublished
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, nocache: true },

    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "elvasco.x",
      images,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover?.url ? [cover.url] : undefined,
    },

    keywords,
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = (await params) ?? {};

  if (!slug || typeof slug !== "string") notFound();

  const work = await prisma.work.findUnique({
    where: { slug },
    include: {
      media: {
        orderBy: { order: "asc" },
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
      tags: { include: { tag: true } },
      linksFrom: { include: { to: true } },
      linksTo: { include: { from: true } },
    },
  });

  if (!work) notFound();

  // Seguridad + coherencia editorial: sólo PUBLISHED es público
  if (work.status !== "PUBLISHED") notFound();

  const cover = pickCover(work.media as unknown as MediaLite[]);
  const dateLabel = formatDate(work.publishedAt ?? work.createdAt);
  const isFeatured = hasTag(work.tags as any, "featured");

  const tagNames = (work.tags ?? []).map((t: any) => t.tag?.name).filter(Boolean) as string[];
  const tagSlugs = (work.tags ?? []).map((t: any) => t.tag?.slug).filter(Boolean) as string[];

  // JSON-LD: graph (Breadcrumb + WebPage + CreativeWork + Person)
  const jsonLd = buildJsonLdGraph({
    slug: work.slug,
    title: work.title,
    excerpt: work.excerpt,
    type: String(work.type),
    tagNames,
    tagSlugs,
    cover: cover ?? null,
    publishedAt: work.publishedAt ?? work.createdAt,
    updatedAt: work.updatedAt,
  });

  const relatedSameType = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: work.type, NOT: { id: work.id } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      type: true,
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
  });

  const related =
    relatedSameType.length > 0
      ? relatedSameType
      : await prisma.work.findMany({
          where: { status: "PUBLISHED", NOT: { id: work.id } },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            publishedAt: true,
            type: true,
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
        });

  const isFallback = relatedSameType.length === 0;
  const relatedTitle = isFallback ? "Más del archivo" : `Más de ${work.type}`;
  const relatedHref = isFallback ? "/work" : `/work?type=${work.type}`;

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-8">
      {/* JSON-LD por pieza */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* breadcrumb */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/work" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Archivo
        </Link>
        <span className="text-zinc-700">/</span>
        <Link href={`/work?type=${work.type}`} className="text-zinc-500 hover:text-zinc-300 transition">
          {work.type}
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">{work.title}</span>
      </div>

      {/* HERO */}
      <header className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              WORK
              <span className="text-zinc-700"> · </span>
              <span className="text-zinc-300">{work.type}</span>
              {dateLabel ? (
                <>
                  <span className="text-zinc-700"> · </span>
                  <span className="text-zinc-500">{dateLabel}</span>
                </>
              ) : null}
            </div>

            <h1 className="leading-[0.9]">
              <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                {work.title}
                <span className="text-red-500">.</span>
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-500">
                {String(work.type).toUpperCase()}
              </span>
            </h1>

            {work.excerpt ? <p className="text-zinc-400 max-w-2xl leading-relaxed">{work.excerpt}</p> : null}

            {work.tags.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {work.tags.map((t) => (
                  <span
                    key={t.tagId}
                    className="text-xs rounded-full border border-zinc-800 bg-black/20 px-2 py-1 text-zinc-400"
                  >
                    {t.tag.name}
                  </span>
                ))}
                {isFeatured ? (
                  <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-1 text-zinc-100">
                    featured
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/booking"
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
              >
                Booking
              </Link>
              <Link
                href="/bio"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
              >
                Bio
              </Link>
              <Link
                href={relatedHref}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Ver más {String(work.type).toLowerCase()}
              </Link>
            </div>

            <div className="text-xs text-zinc-500 pt-1">
              Tip: el cover se amplía desde el poster lateral. <span className="text-red-500">✖</span>
            </div>
          </div>

          {/* poster cover */}
          <WorkCoverPosterClient cover={cover as any} title={work.title} dateLabel={dateLabel} />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <section className="space-y-6">
          {/* Galería (sin cover) */}
          {work.media.length ? (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-semibold">Galería</div>
                <div className="text-xs text-zinc-600">{work.media.length} media</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/20 overflow-hidden">
                <WorkGallery media={work.media as any} title={work.title} hideCoverInGallery />
              </div>
            </div>
          ) : null}

          {/* Texto */}
          {work.content ? (
            <article className="rounded-2xl border border-zinc-800 bg-black/30 p-6 text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {work.content}
            </article>
          ) : (
            <div className="rounded-2xl border border-zinc-900 bg-black/20 p-6 text-sm text-zinc-500">
              Sin texto adicional. La pieza habla sola.
            </div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="space-y-4">
          {/* CTA box */}
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6 space-y-3">
            <div className="text-sm text-zinc-400">
              <span className="text-zinc-200 font-semibold">elvasco</span>
              <span className="text-red-500">.</span>
              <span className="text-red-500">x</span>
              <span className="text-zinc-600"> · </span>
              <span className="text-zinc-500">Underground by choice</span>
              <span className="text-red-500"> ✖️</span>
            </div>

            <div className="text-xs text-zinc-500">Si esto te habla, lo siguiente es fácil.</div>

            <div className="flex flex-col gap-2">
              <Link
                href="/booking"
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition text-center"
              >
                Reservar / Contacto
              </Link>

              <Link
                href="/work"
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition text-center"
              >
                Volver al archivo
              </Link>
            </div>
          </div>

          {/* Ficha */}
          <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 space-y-3">
            <div className="text-sm font-semibold">Ficha</div>

            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Tipo</span>
                <span className="text-zinc-300">{work.type}</span>
              </div>

              {dateLabel ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500">Fecha</span>
                  <span className="text-zinc-300">{dateLabel}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Slug</span>
                <span className="text-zinc-300 truncate max-w-[220px]" title={work.slug}>
                  {work.slug}
                </span>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length ? (
            <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-semibold">{relatedTitle}</div>
                <Link href={relatedHref} className="text-xs text-zinc-500 hover:text-zinc-300 transition">
                  ver todo →
                </Link>
              </div>

              <div className="space-y-3">
                {related.map((r) => {
                  const rCover = pickCover(r.media as any[]);
                  const rDate = formatDate(r.publishedAt);
                  const rTags = (r.tags ?? []).slice(0, 2).map((t) => t.tag.name);

                  return (
                    <Link
                      key={r.id}
                      href={`/work/${r.slug}`}
                      className="group block rounded-xl border border-zinc-900 hover:border-zinc-700 transition overflow-hidden relative glitch-frame glitch-bar"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="h-16 w-16 rounded-lg border border-zinc-800 bg-black overflow-hidden shrink-0">
                          {rCover ? (
                            <img
                              src={rCover.url}
                              alt={rCover.alt ?? ""}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-zinc-950" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">
                            {r.type}
                            {rDate ? <span className="text-zinc-600"> · {rDate}</span> : null}
                          </div>

                          <div className="mt-0.5 text-sm text-zinc-200 group-hover:text-white transition truncate">
                            {r.title}
                          </div>

                          {r.excerpt ? (
                            <div className="mt-1 text-xs text-zinc-500 line-clamp-2">{r.excerpt}</div>
                          ) : null}

                          {rTags.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {rTags.map((t) => (
                                <span
                                  key={t}
                                  className="text-[11px] rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-0 glitch-hover" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Connections */}
          {work.linksFrom.length || work.linksTo.length ? (
            <div className="space-y-4">
              {work.linksFrom.length ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6">
                  <div className="text-sm font-semibold">Conecta con</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                    {work.linksFrom.map((l) => (
                      <li key={l.id} className="flex gap-2">
                        <span className="text-red-500/80">→</span>
                        <Link
                          className="hover:text-zinc-200 transition truncate"
                          href={`/work/${l.to.slug}`}
                          title={l.to.title}
                        >
                          {l.to.title}
                        </Link>
                        {l.label ? <span className="text-zinc-600">· {l.label}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {work.linksTo.length ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6">
                  <div className="text-sm font-semibold">Viene desde</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                    {work.linksTo.map((l) => (
                      <li key={l.id} className="flex gap-2">
                        <span className="text-red-500/80">←</span>
                        <Link
                          className="hover:text-zinc-200 transition truncate"
                          href={`/work/${l.from.slug}`}
                          title={l.from.title}
                        >
                          {l.from.title}
                        </Link>
                        {l.label ? <span className="text-zinc-600">· {l.label}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
