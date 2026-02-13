// src/app/musica/techno/tracks/page.tsx

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

/* =========================================================
   SEO / IA / Arquitectura global
========================================================= */

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/musica/techno/tracks");

  const title = "Techno Tracks Archive";
  const description =
    "Archivo curado de tracks techno: canciones sueltas, bocetos que sobrevivieron y piezas terminadas. Sin relleno.";

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
      title: "Techno Tracks Archive · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/musica-techno-tracks.jpg"),
      //     width: 1200,
      //     height: 630,
      //     alt: "Techno Tracks Archive · elvasco.x",
      //   },
      // ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Techno Tracks Archive · elvasco.x",
      description,
      // images: [siteUrl("/og/musica-techno-tracks.jpg")],
    },

    keywords: [
      "elvasco.x",
      "techno",
      "tracks",
      "archivo",
      "electrónica",
      "electronica",
      "acid",
      "303",
      "hardware",
      "no computer",
      "underground",
      "spotify",
      "youtube",
      "bandcamp",
      "soundcloud",
    ],
  };
}

function pickCover(
  media: Array<{ isCover: boolean; url: string; alt?: string | null }> | undefined
) {
  if (!media?.length) return null;
  return media.find((m) => m.isCover) ?? media[0] ?? null;
}

function platformFromUrl(url: string) {
  const u = url.toLowerCase();

  if (u.includes("spotify.com")) return { label: "Spotify", kind: "spotify" as const };
  if (u.includes("music.apple.com") || u.includes("itunes.apple.com"))
    return { label: "Apple Music", kind: "apple" as const };
  if (u.includes("youtube.com") || u.includes("youtu.be"))
    return { label: "YouTube", kind: "youtube" as const };
  if (u.includes("soundcloud.com")) return { label: "SoundCloud", kind: "soundcloud" as const };
  if (u.includes("bandcamp.com")) return { label: "Bandcamp", kind: "bandcamp" as const };

  return { label: "Link", kind: "other" as const };
}

function uniqBy<T>(arr: T[], key: (v: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const v of arr) {
    const k = key(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

export default async function TechnoTracksPage() {
  const canonical = siteUrl("/musica/techno/tracks");

  /**
   * 🔒 CRITERIO ESTRICTO
   * Solo aparecen TRACKS reales:
   * - type: MUSIC
   * - status: PUBLISHED
   * - tags: music + techno + track
   */
  const tracks = await prisma.work.findMany({
    where: {
      type: "MUSIC",
      status: "PUBLISHED",
      AND: [
        { tags: { some: { tag: { slug: "music" } } } },
        { tags: { some: { tag: { slug: "techno" } } } },
        { tags: { some: { tag: { slug: "track" } } } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 60,
    include: {
      tags: { include: { tag: true } },
      media: { orderBy: { order: "asc" } },
    },
  });

  /* =========================================================
     JSON-LD: Breadcrumb + CollectionPage + ItemList + Person
  ========================================================= */

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Música", item: siteUrl("/musica") },
          { "@type": "ListItem", position: 3, name: "Techno / Electrónica", item: siteUrl("/musica/techno") },
          { "@type": "ListItem", position: 4, name: "Tracks", item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Techno Tracks Archive · elvasco.x",
        url: canonical,
        description:
          "Archivo curado de tracks techno: canciones sueltas, bocetos que sobrevivieron y piezas terminadas. Sin relleno.",
        isPartOf: {
          "@type": "WebPage",
          name: "Techno / Electrónica · elvasco.x",
          url: siteUrl("/musica/techno"),
        },
        about: [
          { "@type": "Thing", name: "Techno" },
          { "@type": "Thing", name: "Electronic music" },
          { "@type": "Thing", name: "Acid techno" },
          { "@type": "Thing", name: "Music track" },
        ],
        mainEntity: {
          "@type": "ItemList",
          name: "Tracks (Techno) · elvasco.x",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: tracks.length,
          itemListElement: tracks.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.title,
            // Mejor URL posible: si quieres “detalle de track” en el futuro, cambia a /work/[slug] o /musica/techno/tracks/[slug]
            url: t.slug ? siteUrl(`/work/${t.slug}`) : canonical,
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
    <main className="space-y-10">
      {/* JSON-LD: SEO/IA */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pt-2">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Techno</div>

          <h1 className="leading-[0.92]">
            <span className="block text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              TRACKS
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              ARCHI<span className="text-red-500">V</span>E
            </span>
          </h1>

          <p className="max-w-2xl text-zinc-400">
            Canciones sueltas, bocetos que sobrevivieron y piezas terminadas.
            Archivo curado. Sin relleno.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/musica/techno"
              className="rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
            >
              ← Volver a Techno
            </Link>
            <Link
              href="/booking"
              className="rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
            >
              Booking
            </Link>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-5">
        {tracks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((t) => {
              const cover = pickCover(t.media as any);

              const embeds = (t.media ?? [])
                .filter((m: any) => m.kind === "embed" && m.url)
                .map((m: any) => ({
                  url: m.url as string,
                  ...platformFromUrl(m.url as string),
                }));

              const buttons = uniqBy(embeds, (e) => e.kind).slice(0, 4);

              const tagChips = (t.tags ?? [])
                .map((x) => x.tag?.slug)
                .filter(Boolean)
                .filter((s) => !["music", "techno", "track"].includes(s))
                .slice(0, 3) as string[];

              return (
                <article
                  key={t.id}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/25 hover:border-zinc-600 transition"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                    {cover ? (
                      <>
                        <img
                          src={cover.url}
                          alt={cover.alt ?? t.title}
                          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
                    )}

                    <div className="absolute left-5 bottom-4 right-5">
                      <div className="text-xs uppercase tracking-wide text-zinc-400">
                        MUSIC · TECHNO · TRACK
                      </div>
                      <div className="mt-1 text-xl font-semibold text-zinc-100 leading-tight">
                        {t.title}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {t.excerpt ? (
                      <p className="text-sm text-zinc-400 leading-relaxed">{t.excerpt}</p>
                    ) : (
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        (Añade un excerpt en el Work para contextualizar este track.)
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {buttons.length ? (
                        buttons.map((b) => (
                          <a
                            key={b.kind}
                            href={b.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-zinc-800 bg-black/30 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-600 transition"
                          >
                            {b.label}
                          </a>
                        ))
                      ) : (
                        <span className="rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500">
                          Sin links aún
                        </span>
                      )}

                      <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-zinc-100">
                        elvasco.x
                      </span>
                    </div>

                    {tagChips.length ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {tagChips.map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6">
            <div className="text-zinc-200 font-semibold">No hay tracks todavía</div>
            <p className="mt-2 text-sm text-zinc-400">
              Crea un Work con:
              <br />— <b>type</b>: MUSIC
              <br />— <b>status</b>: PUBLISHED
              <br />— <b>tags</b>: music + techno + track
              <br />— cover image
              <br />— embeds (Spotify / Apple / YouTube / Bandcamp / SoundCloud)
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
