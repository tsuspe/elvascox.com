// src/app/musica/techno/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import HeroMedia from "@/components/evergreen/HeroMedia";
import MosaicGallery, { type MosaicItem } from "@/components/evergreen/MosaicGallery";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";
// Feature flags de esta página
const SHOW_EXPERIMENTS = false; // cámbialo a true cuando tengas contenido real


/* =========================================================
   SEO / IA / Arquitectura global
========================================================= */

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/musica/techno");

  const title = "Techno & Electrónica";
  const description =
    "Techno, electrónica y acid desde el hardware y la improvisación. Live sets, tracks, experiments y proceso real sin postureo.";

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
      title: "Techno & Electrónica · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/musica-techno.jpg"),
      //     width: 1200,
      //     height: 630,
      //     alt: "Techno & Electrónica · elvasco.x",
      //   },
      // ],
    },

    twitter: {
      card: "summary_large_image",
      title: "Techno & Electrónica · elvasco.x",
      description,
      // images: [siteUrl("/og/musica-techno.jpg")],
    },

    keywords: [
      "elvasco.x",
      "techno",
      "electrónica",
      "electronica",
      "acid",
      "303",
      "liveset",
      "live set",
      "hardware",
      "no computer",
      "improvisación",
      "studio report",
      "underground",
    ],
  };
}

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

/** ===== helpers para links plataforma (embeds) ===== */
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

function yearFromDate(d?: Date | string | null) {
  if (!d) return "";
  const dd = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dd.getTime())) return "";
  return String(dd.getFullYear());
}

export default async function TechnoPage() {
  const canonical = siteUrl("/musica/techno");

  /**
   * Works relacionados (música / techno / acid / electrónica):
   * Ajusta taxonomía cuando tengas tags definitivos.
   */
  const latestTechnoWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: tagOr([
            "music",
            "musica",
            "techno",
            "electronic",
            "electronica",
            "acid",
            "303",
            "live",
            "liveset",
            "hardware",
            "analog",
            "no-computer",
            "jam",
          ]),
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
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
  });

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#origen", label: "Origen" },
    { href: "#tracks", label: "Música" },
    { href: "#videos", label: "Live sets" },
    ...(SHOW_EXPERIMENTS ? [{ href: "#experiments", label: "Experiments" }] : []),
    ...(SHOW_EXPERIMENTS ? [{ href: "#samplepacks", label: "Samplepacks" }] : []),
    { href: "#booking", label: "Booking" },
  ];



  /**
   * ✅ TRACKS (REAL)
   * - Misma maquetación: devolvemos la MISMA forma que el mock.
   * - Fuente: works type=MUSIC, tags techno + track, status PUBLISHED
   */
  const trackWorks = await prisma.work.findMany({
    where: {
      type: "MUSIC",
      status: "PUBLISHED",
      AND: [
        { tags: { some: { tag: { slug: "techno" } } } },
        { tags: { some: { tag: { slug: "track" } } } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 5,
    include: {
      tags: { include: { tag: true } },
      media: { orderBy: { order: "asc" } },
    },
  });

  const tracks = trackWorks.map((w) => {
    const cover = pickCover(w.media as any[]);
    const coverUrl = cover?.url ?? IMG(1052, 1600, 1000);

    // chips: tags extra (mantén estética del mock)
    const chips = (w.tags ?? [])
      .map((x: any) => x.tag?.name || x.tag?.slug)
      .filter(Boolean)
      .filter((s: string) => !["techno", "track", "music", "musica"].includes(String(s).toLowerCase()))
      .slice(0, 3) as string[];

    // links: coge embeds
    const embeds = (w.media ?? [])
      .filter((m: any) => m.kind === "embed" && m.url)
      .map((m: any) => ({ url: String(m.url), ...platformFromUrl(String(m.url)) }));

    // prioriza spotify/apple/youtube y deja el resto fuera para no romper el layout
    const buttons = uniqBy(embeds, (e) => e.kind);
    const pick = (kind: string) => buttons.find((b) => b.kind === kind)?.url;

    return {
      id: w.id,
      title: w.title,
      subtitle: `${w.excerpt ? "Single" : "Track"} · ${yearFromDate(w.publishedAt ?? w.createdAt) || ""}`.trim(),
      desc: w.excerpt ?? " (Añade un excerpt al track para que esta card cuente algo.)",
      cover: coverUrl,
      links: {
        spotify: pick("spotify") ?? "",
        apple: pick("apple") ?? "",
        youtube: pick("youtube") ?? "",
      },
      chips,
    };
  });

    // ✅ NOW PLAYING (REAL): el track más reciente (si existe)
  const nowPlaying = tracks[0]
    ? {
        title: `NOW PLAYING — “${tracks[0].title}”`,
        meta: tracks[0].subtitle,
        cover: { url: tracks[0].cover, alt: tracks[0].title },
        notes: [
          tracks[0].desc,
          "Si esto te vibra, en YouTube está el resto del archivo y los directos.",
        ],
        chips: tracks[0].chips?.length ? tracks[0].chips : ["Hardware", "Improvised", "Underground"],
        links: tracks[0].links,
      }
    : null;


  /**
   * Live sets (YouTube) — placeholders
   * Sustituye los IDs por tus vídeos reales.
   */
  const liveSets = [
    {
      id: "v1",
      title: "TESTOSTERONE   LIVE JAM 01",
      desc: "Full analog jam",
      youtubeId: "Npmek8Ot9Js",
    },
    {
      id: "v2",
      title: "TESTOSTERONE   LIVE JAM 02",
      desc: "No computer just attitude",
      youtubeId: "xBCcB-TA7q8 ",
    },
    {
      id: "v3",
      title: "Disponsable - Live Jam",
      desc: "Live Jam - Analog Music",
      youtubeId: "uxIFRHmHE6c ",
    },
  ];

  /**
   * Sound experiments (mock) — mini “artículos”
   */
  const experiments = [
    {
      id: "exp-1",
      title: "Sound Experiments · #01",
      subtitle: "Filter motion & perceived groove",
      hero: { url: IMG(1040, 1800, 1100), alt: "Experiment 01 (placeholder)" },
      text: [
        "Objetivo: comprobar cuánto groove “aparece” solo moviendo filtro y acento, sin cambiar notas. A veces el tema no necesita más material: necesita dirección.",
        "Patch notes (resumen): cutoff lento con micro-jitters, env mod sutil, distorsión previa al compresor, y reverb corta solo para cola.",
        "Resultado: el loop aguanta más tiempo sin aburrir. Menos melodía, más narrativa.",
      ],
      mosaic: [
        { id: "1", url: IMG(1062, 1600, 1000), alt: "Exp1 1", accent: "bw" },
        { id: "2", url: IMG(1070, 1600, 1000), alt: "Exp1 2", accent: "red" },
        { id: "3", url: IMG(1032, 1600, 1000), alt: "Exp1 3", accent: "bw" },
        { id: "4", url: IMG(1057, 1600, 1000), alt: "Exp1 4", accent: "bw" },
        { id: "5", url: IMG(1039, 1600, 1000), alt: "Exp1 5", accent: "bw" },
        { id: "6", url: IMG(1074, 1600, 1000), alt: "Exp1 6", accent: "bw" },
      ] satisfies MosaicItem[],
    },
    {
      id: "exp-2",
      title: "Sound Experiments · #02",
      subtitle: "Analog Heat drive staging",
      hero: { url: IMG(1069, 1800, 1100), alt: "Experiment 02 (placeholder)" },
      text: [
        "Objetivo: encontrar el punto donde la saturación suma “cuerpo” sin comerse el kick. Distorsionar no es destruir: es esculpir.",
        "Patch notes: drive por etapas (pre → comp → post), HPF antes de saturar, y control de transitorios para que el bombo no se vuelva cartón.",
        "Resultado: más densidad percibida, misma pegada. El truco está en la secuencia, no en el porcentaje.",
      ],
      mosaic: [
        { id: "1", url: IMG(1001, 1600, 1000), alt: "Exp2 1", accent: "bw" },
        { id: "2", url: IMG(1005, 1600, 1000), alt: "Exp2 2", accent: "bw" },
        { id: "3", url: IMG(1028, 1600, 1000), alt: "Exp2 3", accent: "bw" },
        { id: "4", url: IMG(1050, 1600, 1000), alt: "Exp2 4", accent: "red" },
        { id: "5", url: IMG(1052, 1600, 1000), alt: "Exp2 5", accent: "bw" },
        { id: "6", url: IMG(1060, 1600, 1000), alt: "Exp2 6", accent: "bw" },
      ] satisfies MosaicItem[],
    },
  ];

  /* =========================================================
     JSON-LD: Breadcrumb + CollectionPage + ItemList + Person
     (sin romper tu maquetación)
  ========================================================= */

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Música", item: siteUrl("/musica") },
          { "@type": "ListItem", position: 3, name: "Techno / Electrónica", item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Techno / Electrónica · elvasco.x",
        url: canonical,
        description:
          "Techno, electrónica y acid desde el hardware y la improvisación. Live sets, tracks, experiments y proceso real sin postureo.",
        isPartOf: {
          "@type": "WebPage",
          name: "Música · elvasco.x",
          url: siteUrl("/musica"),
        },
        about: [
          { "@type": "Thing", name: "Techno" },
          { "@type": "Thing", name: "Electronic music" },
          { "@type": "Thing", name: "Acid techno" },
          { "@type": "Thing", name: "Hardware live performance" },
        ],
        mainEntity: {
          "@type": "Collection",
          name: "Archivo (Works) · Música",
          url: siteUrl("/work?type=MUSIC"),
        },
        hasPart: [
          { "@type": "WebPage", name: "Música", url: siteUrl("/musica") },
          { "@type": "WebPage", name: "Techno / Electrónica", url: canonical },
          { "@type": "WebPage", name: "Metal", url: siteUrl("/musica/metal") },
        ],
      },
      {
        "@type": "ItemList",
        name: "Tracks (Techno) · elvasco.x",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: tracks.slice(0, 5).map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.title,
          url: siteUrl("/musica/techno#tracks"),
        })),
      },
      {
        "@type": "ItemList",
        name: "Live sets (Techno) · elvasco.x",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: liveSets.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: v.title,
          url: siteUrl("/musica/techno#videos"),
        })),
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
      {/* JSON-LD: SEO/IA */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/musica" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Música
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Techno</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              TECHNO &amp;
            </span>

            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              ELECTR
              <span className="text-red-500">Ó</span>
              NICA
            </span>
          </span>
        }
        subtitle={
          <span>
            Vivo, actual y sin excusas. Hardware, improvisación y obsesión por el groove.
            <span className="text-red-500"> </span>
            Aquí no hay “demo perfecta”: hay proceso.
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
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767610829/FA4C8DC2-480C-4A5F-91A1-5D8F20169DA4_adbevv.png",
            alt: "Techno hero (placeholder)",
          }}
          manifestoTitle="“Analog sound. No computer. Manos en la máquina.”"
          manifestoText="La electrónica me gusta cuando suena a cuerpo: transitorios, saturación, tensión real. Improvisar no es tocar sin pensar: es pensar en tiempo real."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Mantra</div>
          <p className="text-zinc-200 font-semibold">
            Si el loop no aguanta 8 minutos, no es el loop: es la intención.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Prefiero pocos elementos pero bien elegidos. El movimiento viene de cómo respira el sonido:
            filtro, acento, dinámica, silencio. Si suena “limpio” pero no cuenta nada, es wallpaper.
          </p>
        </div>
      </section>

      {/* ORIGEN + FILOSOFÍA */}
      <section id="origen" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="origen"
          title="Origen / Filosofía"
          desc="Cómo llegué a la electrónica y por qué elijo lo analógico y la improvisación."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767611059/IMG_20250216_0006_wywmxm.jpg",
            alt: "Origen 1 (placeholder)",
          }}
        >
          <p>
            Llegué a la electrónica por el mismo sitio que al tattoo: obsesión por textura y ritmo. En metal
            aprendí disciplina. En techno aprendí repetición y trance. Y de repente todo encajó: un patrón
            puede ser una canción. Un loop puede ser una historia.
          </p>
          <p className="text-zinc-400">
            Al principio quise “producir” como se supone que se produce. Luego entendí que a mí me interesa
            más la interpretación que la edición. La máquina como instrumento, no como software.
          </p>
        </EditorialBlock>

        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767611178/IMG_9746_jjumxu.jpg",
            alt: "Filosofía 2 (placeholder)",
          }}
        >
          <p>
            “No computer” no es una religión. Es una herramienta para evitar el bucle infinito de opciones.
            Cuando todo es posible, nada se decide. Con hardware decides rápido: suena o no suena.
          </p>
          <p className="text-zinc-400">
            La improvisación es mi forma de componer. No busco la toma perfecta: busco una toma con vida.
            Y eso implica riesgo. Si no hay riesgo, no hay presente.
          </p>
        </EditorialBlock>

        {/* NOW PLAYING */}
        {/* NOW PLAYING (REAL) */}
        {nowPlaying ? (
          <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
            <div className="p-6 space-y-2">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Now playing</div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold">{nowPlaying.title}</h3>
                <span className="text-zinc-600">·</span>
                <span className="text-sm text-zinc-400">{nowPlaying.meta}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 p-6 pt-0 items-start">
              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-[16/10] w-full max-h-[360px]">
                  <img
                    src={nowPlaying.cover.url}
                    alt={nowPlaying.cover.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                {nowPlaying.notes.map((p, i) => (
                  <p key={i} className={i === 0 ? "text-zinc-200" : "text-zinc-400"}>
                    {p}
                  </p>
                ))}

                <div className="pt-2 flex flex-wrap gap-2">
                  {nowPlaying.chips.map((c) => (
                    <span
                      key={c}
                      className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300"
                    >
                      {c}
                    </span>
                  ))}
                  <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                    elvasco.x
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 text-sm">
                  {nowPlaying.links?.youtube ? (
                    <a
                      href={nowPlaying.links.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                    >
                      YouTube
                    </a>
                  ) : (
                    <a
                      href="https://youtube.com/@elvasco.x"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                    >
                      YouTube
                    </a>
                  )}

                  {nowPlaying.links?.spotify ? (
                    <a
                      href={nowPlaying.links.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                    >
                      Spotify
                    </a>
                  ) : null}

                  {nowPlaying.links?.apple ? (
                    <a
                      href={nowPlaying.links.apple}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                    >
                      Apple Music
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Now playing</div>
            <p className="text-zinc-200 font-semibold">Aún no hay tracks publicados aquí.</p>
            <p className="text-zinc-400">
              En cuanto publiques tu primer Work tipo <span className="text-zinc-200">MUSIC</span> con tags
              <span className="text-zinc-200"> techno + track</span>, esto se auto-rellena.
            </p>
            <div className="pt-2">
              <a
                href="https://youtube.com/@elvasco.x"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Ir a YouTube →
              </a>
            </div>
          </div>
        )}
      </section>

      {/* TRACKS */}
      <section id="tracks" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="tracks"
          title="Música"
          desc="Singles y jams. Lo primero que entra aquí es lo más reciente."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {tracks.slice(0, 5).map((t) => (
            <article
              key={t.id}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/30 hover:border-zinc-600 transition"
            >
              <div className="relative">
                <div
                  className="aspect-[16/10] bg-cover bg-center opacity-80 group-hover:opacity-95 transition"
                  style={{ backgroundImage: `url(${t.cover})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
                <div className="absolute left-4 top-4 text-xs uppercase tracking-wide text-zinc-300/90">
                  {t.subtitle}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="text-xl font-semibold leading-tight">{t.title}</div>
                <p className="text-sm text-zinc-400">{t.desc}</p>

                <div className="flex flex-wrap gap-2">
                  {t.chips.map((c) => (
                    <span
                      key={c}
                      className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-2 py-0.5 text-zinc-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="pt-1 flex flex-wrap gap-2">
                  {t.links.spotify ? (
                    <a
                      href={t.links.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-600 transition"
                    >
                      Spotify
                    </a>
                  ) : null}

                  {t.links.apple ? (
                    <a
                      href={t.links.apple}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-600 transition"
                    >
                      Apple Music
                    </a>
                  ) : null}

                  {t.links.youtube ? (
                    <a
                      href={t.links.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-600 transition"
                    >
                      YouTube
                    </a>
                  ) : null}

                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-zinc-100">
                    elvasco.x
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-end">
          <Link
            href="/musica/techno/tracks"
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Ver todo el historial →
          </Link>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="videos"
          title="Live sets"
          desc="Directos y jams. Si te interesa cómo se decide, aquí está el backstage real."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {liveSets.map((v) => (
            <article
              key={v.id}
              className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden"
            >
              <div className="aspect-video bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="p-5 space-y-2">
                <div className="font-semibold">{v.title}</div>
                <p className="text-sm text-zinc-400">{v.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-end">
          <a
            href="https://youtube.com/@elvasco.x"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Ver la serie en YouTube →
          </a>
        </div>
      </section>

      {/* EXPERIMENTS */}
      {SHOW_EXPERIMENTS ? (
        <section id="experiments" className="scroll-mt-24 space-y-6">
          <SectionHeading
            id="experiments"
            title="Sound experiments"
            desc="Notas, pruebas y resultados. Un laboratorio (sin bata)."
          />

          <div className="space-y-10">
            {experiments.map((exp, idx) => {
              const flip = idx % 2 === 1;

              return (
                <article
                  key={exp.id}
                  className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-6"
                >
                  <header className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {exp.subtitle}
                    </div>
                    <h3 className="text-2xl font-semibold">{exp.title}</h3>
                  </header>

                  <div className="grid gap-6 lg:grid-cols-12 items-start">
                    <div className={flip ? "lg:col-span-5 lg:order-2" : "lg:col-span-5 lg:order-1"}>
                      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                        <img
                          src={exp.hero.url}
                          alt={exp.hero.alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className={flip ? "lg:col-span-7 lg:order-1" : "lg:col-span-7 lg:order-2"}>
                      <div className="space-y-3">
                        {exp.text.map((p, i) => (
                          <p key={i} className={i === 0 ? "text-zinc-200" : "text-zinc-400"}>
                            {p}
                          </p>
                        ))}

                        <div className="rounded-xl border border-zinc-800 bg-black/25 p-4">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">Formato</div>
                          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                            <li>• Objetivo (1 línea)</li>
                            <li>• Patch notes (lista corta)</li>
                            <li>• Resultado (1 frase)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
                      Galería del experimento
                    </div>
                    <MosaicGallery items={exp.mosaic} title={exp.title} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}


      {/* SAMPLEPACKS */}
      {SHOW_EXPERIMENTS ? (
        <section id="samplepacks" className="scroll-mt-24 space-y-6">
          <SectionHeading
            id="samplepacks"
            title="Samplepacks"
            desc="Próximamente. Sonidos reales, grabados y procesados en el mundo elvasco.x."
          />

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Coming soon</div>
            <p className="text-zinc-200 font-semibold">
              No va a ser “otro pack más”. Va a ser material usable para techno crudo: kicks, hats, percus,
              drones y texturas.
            </p>
            <p className="text-zinc-400">
              Cuando lo active, aquí habrá previews, licencias claras y packs por estética (acid / industrial /
              dark / ambient).
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="/contacto"
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Avisarme cuando salga
              </a>
              <a
                href="/musica"
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Ver música →
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto / Booking"
          desc="Colaboraciones, lives, visuales, o música para piezas y contenido. Si te mola lo crudo y lo bien hecho: hablamos."
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

      {/* Últimos works relacionados */}
      {latestTechnoWorks.length ? (
        <section className="pt-6 space-y-4">
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
            {latestTechnoWorks.map((w) => {
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

                    {w.excerpt ? (
                      <p className="text-sm text-zinc-400 line-clamp-2">{w.excerpt}</p>
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
          </div>
        </section>
      ) : null}
    </main>
  );
}
