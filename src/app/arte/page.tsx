// src/app/arte/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import HeroMedia from "@/components/evergreen/HeroMedia";
import type { MosaicItem } from "@/components/evergreen/MosaicGallery";
import MosaicGallery from "@/components/evergreen/MosaicGallery";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

/**
 * Placeholders rápidos para maquetar.
 * Sustituye luego por Cloudinary / tus assets.
 */
const IMG = (id: number, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

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

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/arte");

  const title = "Arte";
  const description =
    "Arte abstracto, fotografía, prints y proceso. Menos elementos, más intención: textura, ritmo y contraste.";

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
      title: "Arte · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/arte.jpg"),
      //     width: 1200,
      //     height: 630,
      //     alt: "Arte · elvasco.x",
      //   },
      // ],
    },

    // ✅ Twitter
    twitter: {
      card: "summary_large_image",
      title: "Arte · elvasco.x",
      description,
      // images: [siteUrl("/og/arte.jpg")],
    },

    // ✅ IA-friendly (semántica sin spam)
    keywords: [
      "elvasco.x",
      "arte",
      "art",
      "arte abstracto",
      "abstract",
      "fotografía",
      "photography",
      "prints",
      "láminas",
      "proceso",
      "studio",
      "textura",
      "contraste",
      "blackwork mindset",
    ],
  };
}

type GalleryItem = {
  id: string;
  url: string;
  label: string;
  href?: string;
};

export default async function ArtePage() {
  const canonical = siteUrl("/arte");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Arte · elvasco.x",
    url: canonical,
    description:
      "Arte abstracto, fotografía, prints y proceso. Menos elementos, más intención: textura, ritmo y contraste.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Collection",
      name: "Archivo (Works)",
      url: siteUrl("/work"),
      // cuando tengas type=ART, lo ideal:
      // url: siteUrl("/work?type=ART"),
    },
    // ✅ IA-friendly: mapa explícito de secciones (anchors)
    hasPart: [
      { "@type": "WebPageElement", name: "Manifiesto", url: `${canonical}#manifiesto` },
      { "@type": "WebPageElement", name: "Conexiones", url: `${canonical}#conexiones` },
      { "@type": "WebPageElement", name: "Galería", url: `${canonical}#galeria` },
      { "@type": "WebPageElement", name: "Contacto", url: `${canonical}#booking` },
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
      take: 6,
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

  /**
   * Works relacionados (arte / foto / proceso).
   * - Primero: tags (robusto y no depende del enum type).
   * - Cuando confirmes tu enum, si quieres añadimos prioridad por type.
   */
  const latestArteWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: tagOr([
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
          ]),
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 18, // 👈 para alimentar selección (6) + últimos 9
    select: selectWork,
  });

  /**
   * Galería basada en Works:
   * - Convertimos covers a items.
   * - Si no hay suficientes, rellenamos con placeholders para no romper el layout.
   */
  const fromWorks: GalleryItem[] = latestArteWorks
    .map((w) => {
      const cover = pickCover(w.media as any[]);
      if (!cover?.url) return null;

      const label = w.title || (w.type ? String(w.type) : "Work");

      return {
        id: String(w.id),
        url: cover.url,
        label,
        href: w.slug ? `/work/${w.slug}` : undefined,
      } satisfies GalleryItem;
    })
    .filter(Boolean) as GalleryItem[];

  const placeholderSeed: GalleryItem[] = [
    { id: "ph1", url: IMG(1062, 1600, 1000), label: "Lámina · #01" },
    { id: "ph2", url: IMG(1070, 1600, 1000), label: "Foto · Backstage ink" },
    { id: "ph3", url: IMG(1032, 1600, 1000), label: "Cuadro · “Cemento vivo”" },
    { id: "ph4", url: IMG(1057, 1600, 1000), label: "Proceso · mesa de taller" },
    { id: "ph5", url: IMG(1039, 1600, 1000), label: "Luz dura · retrato" },
    { id: "ph6", url: IMG(1074, 1600, 1000), label: "Abstracto · líneas orgánicas" },
    { id: "ph7", url: IMG(1001, 1600, 1000), label: "Detalle · textura" },
    { id: "ph8", url: IMG(1050, 1600, 1000), label: "Foto · piel y grano" },
    { id: "ph9", url: IMG(1060, 1600, 1000), label: "Papel · tinta y ritmo" },
  ];

  // ✅ Construimos “gallery” (mínimo 9) con fallback
  const gallery: GalleryItem[] = (() => {
    const base = [...fromWorks];
    let i = 0;
    while (base.length < 9 && i < placeholderSeed.length) {
      base.push({ ...placeholderSeed[i], id: `${placeholderSeed[i].id}-${base.length}` });
      i += 1;
    }
    return base.slice(0, 18);
  })();

  /**
   * Mosaic curado (6) — editorial, impacto, variedad.
   * - Preferimos items reales (covers), si no, placeholder.
   */
  const mosaicItems = gallery
    .slice(0, 6)
    .map((g, idx) => {
      const accent = idx % 5 === 1 || idx % 5 === 4 ? "red" : "bw";
      return {
        id: g.id,
        url: g.url,
        alt: g.label,
        accent,
      };
    }) satisfies MosaicItem[];

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#conexiones", label: "Texto" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Contacto" },
  ];

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
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Home
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Arte</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">ARTE &amp;</span>

            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              PHOT<span className="text-red-500">O</span>
            </span>
          </span>
        }
        subtitle={
          <span>
            El tattoo me enseñó composición. El abstracto me enseñó libertad. La fotografía me obliga a decidir.
            Todo lo demás es ruido.
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
            url: IMG(1011, 2200, 1200),
            alt: "Arte hero (placeholder)",
          }}
          manifestoTitle="“La obra no pide permiso. Pide espacio.”"
          manifestoText="Lo abstracto no es un estilo: es un idioma. A veces la tinta dibuja, a veces la tinta confiesa. La foto no documenta: interpreta el pulso."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Reglas del juego</div>

          <p className="text-zinc-200 font-semibold">Si la pieza no respira, no es que falte algo: es que sobra.</p>

          <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Mantra</div>
            <ul className="mt-2 space-y-1 text-sm text-zinc-400">
              <li>• Menos elementos, más intención.</li>
              <li>• Textura &gt; detalle. Ritmo &gt; decoración.</li>
              <li>• La foto no “enseña”: interpreta.</li>
              <li>• Si queda bonito pero no duele un poco, es wallpaper.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEXTO / CONEXIONES */}
      <section id="conexiones" className="scroll-mt-24 space-y-6">
        <SectionHeading id="conexiones" title="Conexiones" desc="Tattoo, abstracto y fotografía: el mismo músculo con herramientas distintas." />

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Imagen / pieza */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="relative aspect-[4/5] bg-zinc-950">
                <img
                  src={IMG(1008, 1200, 1500)}
                  alt="Conexiones (placeholder)"
                  className="h-full w-full object-cover opacity-90"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-5 bottom-4 right-5">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Arte · Foto · Proceso</div>
                  <div className="mt-1 text-lg font-semibold text-zinc-100 leading-tight">
                    “La textura manda. El resto es ruido.”
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Idea central</div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Para mí, tatuar y componer una imagen es lo mismo: decidir qué{" "}
                  <span className="text-zinc-100 font-semibold">entra</span>, qué{" "}
                  <span className="text-zinc-100 font-semibold">se queda</span>, y qué{" "}
                  <span className="text-zinc-100 font-semibold">desaparece</span>. El estilo sale de repetir esa decisión mil
                  veces.
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                    Blackwork mindset
                  </span>
                  <span className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300">
                    Abstract thinking
                  </span>
                  <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                    elvasco.x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Texto + pilares */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Por qué está todo conectado</div>
                <p className="text-zinc-200 leading-relaxed">
                  El tattoo me entrenó el ojo para leer <span className="text-zinc-100 font-semibold">peso</span>,{" "}
                  <span className="text-zinc-100 font-semibold">flujo</span> y{" "}
                  <span className="text-zinc-100 font-semibold">composición</span>. El abstracto me dio libertad para romper
                  reglas sin perder intención. Y la foto/film me obliga a elegir el instante: encuadre, luz y silencio.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  No busco “enseñar” lo que veo. Busco <span className="text-zinc-200 font-semibold">interpretarlo</span>. Si
                  la imagen queda demasiado correcta, sospecho. Prefiero una verdad rara a una postal bonita.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Tattoo → Abstracto</div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Patrones, respiración, negros grandes. Menos “detalle”, más ritmo.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Abstracto → Foto</div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Componer con vacío, textura y contraste. La luz como tinta.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Foto → Film</div>
                  <p className="mt-2 text-sm text-zinc-300">
                    Movimiento mínimo, intención máxima. Un plano también es un patrón.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Reglas de la casa</div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li>• Menos elementos, más intención.</li>
                <li>• Textura &gt; detalle. Ritmo &gt; decoración.</li>
                <li>• La foto no “enseña”: interpreta.</li>
                <li>• Si no hay tensión, no hay historia.</li>
              </ul>

              <div className="pt-4 flex flex-wrap gap-2">
                <Link
                  href="/arte/galeria"
                  className="rounded-full border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
                >
                  Ver galería completa →
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-zinc-100 hover:border-red-500/70 transition"
                >
                  Encargar / colaborar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="galeria" 
          title="Galería"
          desc="Primero una selección curada (editorial). Debajo: últimos 9, tal cual salen del taller."
        />

        {/* Mosaic curado */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Selección</div>
          <MosaicGallery items={mosaicItems} title="Arte · Photo — selección" />
        </div>

        {/* Grid 9 últimos */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Últimos 9</div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(0, 9).map((g) => {
              const Card = (
                <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/30 hover:border-zinc-600 transition">
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                    <img
                      src={g.url}
                      alt={g.label}
                      className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <div className="absolute left-4 bottom-3 right-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-400">Arte · Photo</div>
                      <div className="mt-1 text-sm font-semibold text-zinc-100 leading-tight">{g.label}</div>
                    </div>
                  </div>
                </article>
              );

              return g.href ? (
                <Link key={g.id} href={g.href}>
                  {Card}
                </Link>
              ) : (
                <div key={g.id}>{Card}</div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/arte/galeria"
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Ver galería completa →
          </Link>
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

      {/* Últimos works relacionados */}
      {latestArteWorks.length ? (
        <section className="pt-2 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works relacionados</div>
            </div>

            <Link href="/work" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestArteWorks.slice(0, 6).map((w) => {
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
                        <span className="text-zinc-600"> · {new Date(w.publishedAt).toLocaleDateString()}</span>
                      ) : null}
                    </div>

                    <div className="font-semibold leading-tight">{w.title}</div>

                    {w.excerpt ? <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p> : null}

                    {tagNames.length ? (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {tagNames.map((t: string) => (
                          <span key={t} className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400">
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
        <section className="pt-2">
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 text-zinc-400">
            Aún no hay works publicados con tags de arte/foto. En cuanto publiques unos cuantos, esto se llena solo.
          </div>
        </section>
      )}
    </main>
  );
}
