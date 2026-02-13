// src/app/musica/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import HeroMedia from "@/components/evergreen/HeroMedia";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";
import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/musica");

  const title = "Música";
  const description =
    "Techno/electrónica y metal: ritmo, textura, tensión real. Lives, tracks, procesos y studio reports sin postureo.";

  return {
    title,
    description,
    alternates: { canonical },

    // ✅ SEO/Indexación
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

    // ✅ OpenGraph
    openGraph: {
      title: "Música · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/musica.jpg"), // 👈 cuando tengas OG real
      //     width: 1200,
      //     height: 630,
      //     alt: "Música · elvasco.x",
      //   },
      // ],
    },

    // ✅ Twitter
    twitter: {
      card: "summary_large_image",
      title: "Música · elvasco.x",
      description,
      // images: [siteUrl("/og/musica.jpg")], // 👈 cuando tengas OG real
    },

    // ✅ IA-friendly extra (no “keywords stuffing”, solo guía)
    keywords: [
      "elvasco.x",
      "música",
      "techno",
      "electrónica",
      "acid",
      "liveset",
      "metal",
      "producción musical",
      "hardware",
      "studio report",
    ],
  };
}

/**
 * Placeholders rápidos para maquetar.
 * Sustituye luego por Cloudinary / tus assets.
 */
const IMG = (id: number, w = 1600, h = 1000) =>
  `https://picsum.photos/id/${id}/${w}/${h}`;

/** Cover helper para works */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

/** Mini helper “tag OR slug/name” */
function tagOr(slugsOrNames: string[]) {
  return {
    OR: slugsOrNames.flatMap((t) => [{ slug: t }, { name: t }]),
  };
}

export default async function MusicHomePage() {
  const canonical = siteUrl("/musica");

  // ✅ JSON-LD (landing editorial / colección)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Música · elvasco.x",
    url: canonical,
    description:
      "Techno/electrónica y metal: ritmo, textura, tensión real. Lives, tracks, procesos y studio reports sin postureo.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    // útil para agentes: deja explícito el “archivo” donde vive el contenido
    mainEntity: {
      "@type": "Collection",
      name: "Archivo (Works)",
      url: siteUrl("/work?type=MUSIC"),
    },
    // ✅ IA-friendly: deja claras las “puertas”
    hasPart: [
      {
        "@type": "WebPage",
        name: "Techno / Electrónica",
        url: siteUrl("/musica/techno"),
      },
      {
        "@type": "WebPage",
        name: "Metal",
        url: siteUrl("/musica/metal"),
      },
    ],
  };

  const selectWork = {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    type: true,
    publishedAt: true,
    tags: { include: { tag: true } },
    media: {
      orderBy: { order: "asc" as const },
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
  };

  // ✅ “Últimos works” robusto: primero por type=MUSIC, si no hay, fallback por tags
  const latestByType = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: "MUSIC" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: selectWork,
  });

  const latestMusicWorks =
    latestByType.length > 0
      ? latestByType
      : await prisma.work.findMany({
          where: {
            status: "PUBLISHED",
            tags: {
              some: {
                tag: tagOr([
                  "music",
                  "musica",
                  "techno",
                  "metal",
                  "live",
                  "liveset",
                  "track",
                ]),
              },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: selectWork,
        });

  // ✅ Highlights: intenta por type primero (MUSIC), si no hay, fallback por tags
  const highlightsByType = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: "MUSIC" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      ...selectWork,
      media: {
        orderBy: { order: "asc" as const },
        take: 2,
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

  const highlights =
    highlightsByType.length > 0
      ? highlightsByType
      : await prisma.work.findMany({
          where: {
            status: "PUBLISHED",
            tags: {
              some: {
                tag: tagOr([
                  "music",
                  "musica",
                  "track",
                  "liveset",
                  "thought",
                  "play-thoughts",
                ]),
              },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            ...selectWork,
            media: {
              orderBy: { order: "asc" as const },
              take: 2,
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

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#caminos", label: "Caminos" },
    { href: "#dosmundos", label: "Dos mundos" },
    { href: "#highlights", label: "Highlights" },
    { href: "#booking", label: "Booking" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-12">
      {/* JSON-LD: CollectionPage */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Home
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Música</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              MUSIC
            </span>

            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              WORLD
              <span className="text-red-500">.</span>
            </span>
          </span>
        }
        subtitle={
          <span>
            Dos caminos. Una obsesión: ritmo, textura y tensión real. Sin
            postureo, con intención.
          </span>
        }
      />

      {/* Nav interno sticky */}
      <AnchorNav items={navItems} />

      {/* HERO + manifiesto */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767608481/IMG_20250318_0001_qo2cvo.jpg",
            alt: "Music hero (placeholder)",
          }}
          manifestoTitle="“La música es un tatuaje en el aire: patrón, golpe, cicatriz.”"
          manifestoText="Me interesa cuando suena a verdad: transitorios, saturación, respiración y decisión. En techno: trance. En metal: puño y disciplina. En ambos: carácter."
        />
      </section>

      {/* CAMINOS */}
      <section id="caminos" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="caminos"
          title="Elige camino"
          desc="Entrar por la puerta correcta importa. Si te metes por la equivocada… te pierdes (o te encuentras)."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Techno */}
          <Link
            href="/musica/techno"
            className="group rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden hover:border-zinc-600 transition"
          >
            <div className="relative">
              <div
                className="aspect-[16/9] bg-cover bg-center opacity-85 group-hover:opacity-95 transition"
                style={{ backgroundImage: `url(${"https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767608683/IMG_9740_ematne.jpg"})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
              <div className="absolute left-5 top-5 text-xs uppercase tracking-wide text-zinc-300/90">
                Camino 01
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-2xl font-semibold">
                Techno / Electrónica
                <span className="text-red-500"> ✖</span>
              </div>
              <p className="text-zinc-400">
                Hardware, improvisación y obsesión por el groove. “No computer”
                como disciplina, no como religión.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Acid / 303
                </span>
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Live takes
                </span>
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Studio reports
                </span>
              </div>

              <div className="pt-2 text-sm text-zinc-300">
                Entrar →{" "}
                <span className="text-zinc-500">(tracks, lives, experiments)</span>
              </div>
            </div>
          </Link>

          {/* Metal */}
          <Link
            href="/musica/metal"
            className="group rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden hover:border-zinc-600 transition"
          >
            <div className="relative">
              <div
                className="aspect-[16/9] bg-cover bg-center opacity-85 group-hover:opacity-95 transition"
                style={{ backgroundImage: `url(${"https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767608836/IMG_7245_c4nftx.jpg"})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
              <div className="absolute left-5 top-5 text-xs uppercase tracking-wide text-zinc-300/90">
                Camino 02
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-2xl font-semibold">
                Metal
                <span className="text-red-500"> ✖</span>
              </div>
              <p className="text-zinc-400">
                Disciplina, energía y peso emocional. Riffs, narrativa y esa
                violencia controlada que te ordena por dentro.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Riffs
                </span>
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Letras / concepto
                </span>
                <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                  Producción
                </span>
              </div>

              <div className="pt-2 text-sm text-zinc-300">
                Entrar →{" "}
                <span className="text-zinc-500">(temas, ideas, procesos)</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Editorial */}
      <section id="dosmundos" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="dosmundos"
          title="Dos mundos"
          desc="Lo mismo, con dos idiomas. Uno te hipnotiza. El otro te despierta a hostias."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767609049/IMG_9741_psncln.jpg",
            alt: "Música editorial (placeholder)",
          }}
        >
          <p>
            Para mí la música es una herramienta de estado. Me regula. Me empuja.
            Me limpia. Cuando no sé qué decir, un loop lo dice por mí. Cuando
            necesito recordar disciplina, un riff me la pone delante.
          </p>

          <p className="text-zinc-400">
            En techno, el foco está en el cuerpo: groove, repetición, tensión y
            control. En metal, el foco está en el pecho: energía, narrativa, peso
            y verdad. Lo común: carácter. Si no hay carácter, no hay nada.
          </p>

          <div className="pt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Techno
              </div>
              <div className="mt-1 text-zinc-300">
                Trance, textura, decisión en tiempo real.
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Metal
              </div>
              <div className="mt-1 text-zinc-300">
                Disciplina, violencia controlada, relato.
              </div>
            </div>
          </div>
        </EditorialBlock>
      </section>

      {/* Highlights */}
      {highlights.length ? (
        <section id="highlights" className="scroll-mt-24 space-y-6">
          <SectionHeading
            id="highlights"
            title="Highlights"
            desc="Tres migas para que veas que esto está vivo. Lo gordo está dentro."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? []).slice(0, 3).map((t: any) => t.tag.name);

              return (
                <Link
                  key={w.id}
                  href={`/work/${w.slug}`}
                  className="rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition"
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                      <MediaRenderer media={cover as any} className="h-full w-full" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" />
                  )}

                  <div className="mt-3 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {w.type}
                      {w.publishedAt ? (
                        <span className="text-zinc-600">
                          {" "}
                          · {new Date(w.publishedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>

                    <div className="font-semibold leading-tight">{w.title}</div>

                    {w.excerpt ? (
                      <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p>
                    ) : null}

                    {tagNames.length ? (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {tagNames.map((t: string) => (
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
          </div>

          <div className="flex justify-end">
            <Link
              href="/work?type=MUSIC"
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
            >
              Ver archivo →
            </Link>
          </div>
        </section>
      ) : null}

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto / Booking"
          desc="Colaboraciones, lives, visuales y música para piezas o contenido. Si te mola lo crudo y lo bien hecho: hablamos."
          primaryHref="/contacto"
          primaryLabel="Contacto"
          secondaryHref="https://youtube.com/@elvasco.x"
          secondaryLabel="YouTube"
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

              <div className="text-xs text-zinc-500">Redes (placeholder):</div>

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

      {/* Últimos works */}
      {latestMusicWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works</div>
            </div>

            <Link
              href="/work?type=MUSIC"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestMusicWorks.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? []).slice(0, 3).map((t: any) => t.tag.name);

              return (
                <Link
                  key={w.id}
                  href={`/work/${w.slug}`}
                  className="rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition"
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                      <MediaRenderer media={cover as any} className="h-full w-full" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" />
                  )}

                  <div className="mt-3 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {w.type}
                      {w.publishedAt ? (
                        <span className="text-zinc-600">
                          {" "}
                          · {new Date(w.publishedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>

                    <div className="font-semibold leading-tight">{w.title}</div>

                    {w.excerpt ? (
                      <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p>
                    ) : null}

                    {tagNames.length ? (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {tagNames.map((t: string) => (
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
          </div>
        </section>
      ) : null}
    </main>
  );
}
