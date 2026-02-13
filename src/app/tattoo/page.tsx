// src/app/tattoo/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import SectionHeading from "@/components/evergreen/SectionHeading";
import MediaRenderer from "@/components/MediaRenderer";
import SectionHero from "@/components/SectionHero";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/tattoo");

  const title = "Tattoo · elvasco.x";
  const description =
    "Blackwork orgánico, blackout, op art/patrones y cultura del oficio. Técnica, composición y proceso real: diseño, sesión y curación.";

  return {
    title: "Tattoo",
    description,
    alternates: { canonical },

    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    keywords: [
      "tattoo",
      "tatuaje",
      "blackwork",
      "blackout",
      "blackwork orgánico",
      "op art",
      "patrones",
      "geometría",
      "composición",
      "curación",
      "oficio",
      "elvasco.x",
    ],

    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      locale: "es_ES",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Placeholders rápidos para maquetación:
 * - Luego sustituyes por Cloudinary/tu media real.
 */
const IMG = (id: number, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

/** Cover helper para works */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

/** Mini helper “tag OR slug/name” para Prisma */
function tagOr(slugsOrNames: string[]) {
  return {
    OR: slugsOrNames.flatMap((t) => [{ slug: t }, { name: t }]),
  };
}

/**
 * Youtube embed:
 * - Server Component friendly.
 * - Responsive con aspect-video.
 */
function YouTubeCard({ id, title, desc }: { id: string; title: string; desc: string }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-black/30 p-4 hover:border-zinc-600 transition">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <div className="aspect-video">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="text-sm font-semibold leading-tight">{title}</div>
        <p className="text-sm text-zinc-400">{desc}</p>
      </div>
    </article>
  );
}

const posters = [
  {
    href: "/tattoo/blackout",
    title: "Blackout",
    desc: "Negro sólido, diseño y composición para piezas grandes.",
    bg: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767523058/IMG_3939_vc8act.jpg",
    chips: ["Proyectos grandes", "Curación", "Negro sólido"],
  },
  {
    href: "/tattoo/blackwork-organic-abstract",
    title: "Blackwork orgánico / abstract",
    desc: "Patrones, flujo, geometría y textura. Oscuro pero vivo.",
    bg: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767523058/IMG_3248_kitrv3.jpg",
    chips: ["Texturas", "Flow", "Anatomía"],
  },
  {
    href: "/tattoo/op-art-pattern-abstraction",
    title: "Op Art & Patterns",
    desc: "Geometría hipnótica, vibración y abstracción construida a través del patrón.",
    bg: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767523059/IMG_1126_kkcaea.jpg",
    chips: ["Op Art", "Geometría", "Sistemas"],
  },
  {
    href: "/tattoo/science",
    title: "Tattoo Science & History",
    desc: "Máquinas, agujas, historia, experimentos y cultura del oficio.",
    bg: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767523059/29BC466C-8EB2-48B1-9475-B03B50C0C22D_khjylq.jpg",
    chips: ["Tradición", "Bobinas", "Agujas"],
  },
];

export default async function TattooPage() {
  // ✅ JSON-LD (landing editorial / colección)
  const canonical = siteUrl("/tattoo");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tattoo · elvasco.x",
    url: canonical,
    description:
      "Blackwork orgánico, blackout, op art/patrones y cultura del oficio. Técnica, composición y proceso real: diseño, sesión y curación.",
    inLanguage: "es-ES",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Collection",
      name: "Archivo (Works)",
      url: siteUrl("/work?type=TATTOO"),
    },
    hasPart: posters.map((p) => ({
      "@type": "WebPage",
      name: p.title,
      url: siteUrl(p.href),
    })),
  };

  /**
   * Últimos works de Tattoo:
   * - Primero por type (tu modelo “core”).
   * - Si aún no tienes type=TATTOO (o está vacío), fallback por tags.
   */
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

  const latestByType = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: "TATTOO" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: selectWork,
  });

  const latestTattooWorks =
    latestByType.length > 0
      ? latestByType
      : await prisma.work.findMany({
          where: {
            status: "PUBLISHED",
            tags: {
              some: {
                tag: tagOr([
                  "tattoo",
                  "tatuaje",
                  "blackwork",
                  "blackout",
                  "organic",
                  "abstract",
                  "pattern",
                  "patterns",
                  "op-art",
                  "opart",
                  "geometric",
                  "geometry",
                  "neotribal",
                ]),
              },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: selectWork,
        });

  /**
   * “Studio report” (placeholders de IDs)
   */
  const studioReports = [
    {
      id: "maVORVFkQeU",
      title: "STUDIO REPORT - Week #16 - 2023",
      desc: "- Chest tattoo, Filling some patterns, Forearm texture tattoo",
    },
    {
      id: "DzWrvcWnfeI",
      title: "STUDIO REPORT - Week #19 - 2023",
      desc: "Head tatu, Finishing hanmade Mandala, Forearm blackout",
    },
    {
      id: "1eE1kOtwEK4",
      title: "STUDIO REPORT - Special: The Black Alien",
      desc: "In this special edition of our studio report, we have the first sit for “The Black Alien” total black project by @blackprada.",
    },
  ];

  return (
    <main className="space-y-12">
      {/* JSON-LD: CollectionPage */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO principal */}
      <section className="space-y-10">
        <SectionHero
          kicker="Tattoo"
          title={
            <span className="block leading-[0.9]">
              <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
                TATTOO
              </span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
                WOR<span className="text-red-500">L</span>D
              </span>
            </span>
          }
          subtitle="No es solo estética: es técnica, tradición y composición. Si vienes por la tinta, aquí también hay música, film y dev."
          quote="De pintar mis brazos con bolígrafo en el colegio a cubrir brazos enteros de Negro.."
          ctas={[
            { href: "/booking", label: "Booking", variant: "solid" },
            { href: "/bio", label: "Conocer al Vasco", variant: "ghost" },
          ]}
        />
      </section>

      {/* Posters (navegación principal) */}
      <section className="mx-auto max-w-6xl px-5">
        <SectionHeading
          id="camino"
          title="Elige un camino"
          desc="Cuatro puertas. Dentro está el detalle: proceso, referencias, curación y trabajos."
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {posters.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-black transition hover:border-zinc-600"
            >
              <div className="relative aspect-[9/14]">
                <img
                  src={p.bg}
                  alt={p.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />

                <div className="relative z-10 flex h-full flex-col justify-end p-5 gap-3">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Tattoo</div>

                  <h3 className="text-2xl font-bold leading-[1.05]">{p.title}</h3>

                  <p className="text-sm text-zinc-300 leading-snug max-w-[38ch]">{p.desc}</p>

                  <div className="pt-1 flex flex-wrap gap-2">
                    {p.chips.map((c) => (
                      <span
                        key={c}
                        className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300"
                      >
                        {c}
                      </span>
                    ))}

                    <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                      elvasco<span className="text-red-500">.</span>x
                    </span>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-white/5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Enfoque */}
      <section className="mx-auto max-w-6xl px-5 space-y-6">
        <SectionHeading
          id="enfoque"
          title="Mi enfoque"
          desc="Una visión general."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767523059/IMG_6896_xm1kda.jpg",
            alt: "Tattoo vision (placeholder)",
          }}
        >
          <p>
            Para mí el tatuaje es una disciplina de composición aplicada a un cuerpo vivo. No trabajo sobre
            papel: trabajo sobre tensión, curvas, respiración, movimiento. Lo que se ve “bonito” en una foto
            puede ser mediocre en piel si no está pensado para esa anatomía.
          </p>
          <p className="text-zinc-400">
            Me interesan los proyectos que tienen intención: piezas grandes, estructuras claras, contraste
            real y una lectura que aguante el paso del tiempo. El negro no es un color: es una decisión. Y
            cuando esa decisión es grande, la técnica deja de ser “opcional”.
          </p>
          <p className="text-zinc-400">
            Por eso insisto en proceso y curación. Un tatuaje no termina cuando se apaga la máquina.
            Termina cuando la piel lo integra. Ahí es donde se nota quién trabaja con método… y quién solo
            busca el aplauso rápido.
          </p>
        </EditorialBlock>

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">En resumen</div>
          <p className="mt-2 text-zinc-200 font-semibold">Diseño, sesión, curación. Si falla una, falla todo.</p>
          <p className="mt-2 text-zinc-400 leading-relaxed">
            Prefiero hacer menos trabajos, pero que estén cerrados. Que se noten sólidos, elegantes, macarras
            cuando toca… y sobre todo: que tengan lectura en el cuerpo.
          </p>
        </div>
      </section>

      {/* YouTube / Studio report */}
      <section className="mx-auto max-w-6xl px-5 space-y-6">
        <SectionHeading
          id="video"
          title="Studio report"
          desc="Vídeos cortos para ver el backstage: decisiones, proceso y realidad del oficio."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {studioReports.map((v) => (
            <YouTubeCard key={v.id} id={v.id} title={v.title} desc={v.desc} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Tip: aquí mola tener 3. Si metes 10, esto deja de ser landing y se vuelve playlist.
          </p>

          <a
            href="https://www.youtube.com/watch?v=maVORVFkQeU&list=PLjx2lu7j9eLwjWCYfN0FLP0RxUY65_C5O"
            target="_blank"
            rel="noreferrer"
            className="text-sm rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition"
          >
            Ver la serie en YouTube →
          </a>
        </div>
      </section>

      {/* Booking / contacto */}
      <section className="mx-auto max-w-6xl px-5 space-y-6">
        <CTABox
          title="Booking"
          desc="Si te cuadra este enfoque (proceso, intención y curación bien hecha), hablamos. Los proyectos grandes se construyen con calma."
          primaryHref="/booking"
          primaryLabel="Reservar / Contacto"
          secondaryHref="/contacto"
          secondaryLabel="Contacto directo"
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

      {/* Últimos works (tattoo) */}
      {latestTattooWorks.length ? (
        <section className="mx-auto max-w-6xl px-5 pt-2 pb-16 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works</div>
            </div>

            <Link
              href="/work?type=TATTOO"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestTattooWorks.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? []).slice(0, 3).map((t) => t.tag.name);

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

                    {w.excerpt ? <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p> : null}

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
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 text-zinc-400">
            Aún no hay works publicados de tattoo. En cuanto publiques unos cuantos, este bloque se llena solo.
          </div>
        </section>
      )}
    </main>
  );
}
