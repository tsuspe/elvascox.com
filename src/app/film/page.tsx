// src/app/film/page.tsx
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
import TattooRevealSlider from "@/components/evergreen/TattooRevealSlider";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/film");

  const title = "Film";
  const description =
    "Filmmaking, videoclips, documentales, edición, VFX y color grading. Crudo y cuidado: ritmo, textura y verdad.";

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
      title: "Film · elvasco.x",
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
      // images: [
      //   {
      //     url: siteUrl("/og/film.jpg"), // 👈 cuando tengas OG real
      //     width: 1200,
      //     height: 630,
      //     alt: "Film · elvasco.x",
      //   },
      // ],
    },

    // ✅ Twitter
    twitter: {
      card: "summary_large_image",
      title: "Film · elvasco.x",
      description,
      // images: [siteUrl("/og/film.jpg")], // 👈 cuando tengas OG real
    },

    // ✅ IA-friendly (sin spam; guía semántica)
    keywords: [
      "elvasco.x",
      "film",
      "filmmaking",
      "videoclip",
      "documental",
      "edición",
      "montaje",
      "VFX",
      "compositing",
      "motion graphics",
      "color grading",
      "DaVinci Resolve",
      "After Effects",
    ],
  };
}

/**
 * Placeholders rápidos para maquetar.
 * Sustituye luego por Cloudinary / tus assets.
 */
const IMG = (id: number, w = 1600, h = 1000) =>
  `https://picsum.photos/id/${id}/${w}/${h}`;

// ✅ mismo id, distinto “look” (picsum soporta grayscale y blur)
const IMGQ = (id: number, w = 1600, h = 1000, q = "") =>
  `https://picsum.photos/id/${id}/${w}/${h}${q ? `?${q}` : ""}`;

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

export default async function FilmPage() {
  const canonical = siteUrl("/film");

  // ✅ JSON-LD (landing editorial / colección)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Film · elvasco.x",
    url: canonical,
    description:
      "Filmmaking, videoclips, documentales, edición, VFX y color grading. Crudo y cuidado: ritmo, textura y verdad.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Collection",
      name: "Archivo (Works)",
      url: siteUrl("/work?type=FILM"),
    },
    // ✅ IA-friendly: mapa explícito de secciones (anchors)
    hasPart: [
      { "@type": "WebPageElement", name: "Manifiesto", url: `${canonical}#manifiesto` },
      { "@type": "WebPageElement", name: "Inicios", url: `${canonical}#inicios` },
      { "@type": "WebPageElement", name: "Videoclips", url: `${canonical}#videoclips` },
      { "@type": "WebPageElement", name: "Lyric videos", url: `${canonical}#lyric` },
      { "@type": "WebPageElement", name: "Vlogs / Docs", url: `${canonical}#doc` },
      { "@type": "WebPageElement", name: "VFX", url: `${canonical}#vfx` },
      { "@type": "WebPageElement", name: "Color grading", url: `${canonical}#grading` },
      { "@type": "WebPageElement", name: "Tool stack", url: `${canonical}#stack` },
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

  /**
   * ✅ Últimos works:
   * - Primero por type=FILM (lo semántico)
   * - Si aún no tienes FILM poblado, fallback por tags (tu lista)
   */
  const latestByType = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: "FILM" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: selectWork,
  });

  const latestFilmWorks =
    latestByType.length > 0
      ? latestByType
      : await prisma.work.findMany({
          where: {
            status: "PUBLISHED",
            tags: {
              some: {
                tag: tagOr([
                  "film",
                  "filmmaking",
                  "video",
                  "cine",
                  "audiovisual",
                  "clip",
                  "videoclip",
                  "lyricvideo",
                  "vfx",
                  "cg",
                  "compositing",
                  "motion",
                  "color",
                  "grading",
                  "documental",
                  "interview",
                  "vlog",
                  "reel",
                  "edit",
                  "montaje",
                ]),
              },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: selectWork,
        });

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#inicios", label: "Inicios" },
    { href: "#videoclips", label: "Videoclips" },
    { href: "#lyric", label: "Lyric videos" },
    { href: "#doc", label: "Vlogs / Docs" },
    { href: "#vfx", label: "VFX" },
    { href: "#grading", label: "Color" },
    { href: "#stack", label: "Tool stack" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Contacto" },
  ];

  /**
   * Ejemplos YouTube (placeholders)
   * Cambia los IDs por los tuyos reales.
   */
  const clips = [
    {
      id: "c1",
      title: "Videoclip — Performance + narrativa (dark / raw)",
      desc: "Ritmo, contraste y montaje que respira con la música. Pocas tomas, mucha intención.",
      youtubeId: "M7lc1UVf-VE",
    },
    {
      id: "c2",
      title: "Videoclip — Textura + glitch sutil (cinematic)",
      desc: "Grano, movimiento mínimo y cortes al beat. No es postureo: es atmósfera.",
      youtubeId: "ysz5S6PUM-U",
    },
  ];

  const lyricVideos = [
    {
      id: "l1",
      title: "Lyric video — tipografía como ritmo",
      desc: "Kinetics simples, legibilidad y acento visual (rojo) cuando toca apretar.",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      id: "l2",
      title: "Lyric video — textura + montaje editorial",
      desc: "Minimalismo, grunge y beats visuales. Lo justo para que el tema mande.",
      youtubeId: "aqz-KE-bpKQ",
    },
  ];

  const docs = [
    {
      id: "d1",
      title: "Documental corto — proceso y oficio",
      desc: "Cámara como testigo. Nada de humo: manos, decisiones y tiempo real.",
      youtubeId: "ScMzIvxBSi4",
    },
    {
      id: "d2",
      title: "Entrevista / vlog — conversación con intención",
      desc: "Planos limpios, audio cuidado y ritmo editorial sin matar la naturalidad.",
      youtubeId: "E7wJTI-1dvQ",
    },
  ];

  // ✅ sliders con MISMA foto para before/after
  const vfxExamples = [
    {
      id: "vfx1",
      title: "VFX — limpieza + integración",
      desc: "El truco no es el efecto: es que parezca que siempre estuvo ahí.",
      before: { url: IMGQ(1022, 1800, 1100, "blur=2"), alt: "Raw frame (placeholder)" },
      after: { url: IMGQ(1022, 1800, 1100, ""), alt: "VFX final frame (placeholder)" },
    },
    {
      id: "vfx2",
      title: "VFX — glitch controlado (no meme)",
      desc: "Artefacto con propósito: ritmo, no distracción.",
      before: {
        url: IMGQ(1034, 1800, 1100, "grayscale&blur=1"),
        alt: "Raw glitch base (placeholder)",
      },
      after: { url: IMGQ(1034, 1800, 1100, ""), alt: "Glitch integrado (placeholder)" },
    },
  ];

  const gradingExamples = [
    {
      id: "g1",
      title: "Color grading — piel viva, negros con intención",
      desc: "Warm highlights, cool shadows, contraste controlado. Cinemático sin plasticazo.",
      before: { url: IMGQ(1042, 1800, 1100, "grayscale"), alt: "RAW (placeholder)" },
      after: { url: IMGQ(1042, 1800, 1100, ""), alt: "GRADE (placeholder)" },
    },
    {
      id: "g2",
      title: "Color grading — blanco y negro (duro, editorial)",
      desc: "Chiaroscuro, grano y caída a negro. El detalle se gana, no se regala.",
      before: { url: IMGQ(1056, 1800, 1100, ""), alt: "RAW base (placeholder)" },
      after: { url: IMGQ(1056, 1800, 1100, "grayscale"), alt: "B/W final (placeholder)" },
    },
  ];

  const tools = [
    { name: "DaVinci Resolve", note: "Edición / Color / Deliver" },
    { name: "After Effects", note: "Motion / VFX / Compo" },
    { name: "Premiere Pro", note: "Edición rápida / workflows" },
    { name: "Photoshop", note: "Stills / matte / cleanup" },
    { name: "Lightroom", note: "Foto / look dev" },
    { name: "Blender", note: "3D básico / assets" },
    { name: "Topaz / AI tools", note: "Upscale / denoise (con cuidado)" },
    { name: "FFmpeg", note: "Automations / renders" },
  ];

  const miniGallery = [
    { id: "mg1", title: "Short edit — teaser", youtubeId: "M7lc1UVf-VE" },
    { id: "mg2", title: "Behind the scenes", youtubeId: "ysz5S6PUM-U" },
    { id: "mg3", title: "Process cut", youtubeId: "ScMzIvxBSi4" },
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
        <span className="text-zinc-300">Film</span>
      </div>

      {/* Título brutalista */}
      <SectionTitle
        title={
          <span className="block leading-[0.9]">
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
              FILMMAKING
            </span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
              &amp; STORYTELLIN<span className="text-red-500">G</span>
            </span>
          </span>
        }
        subtitle={
          <span>
            La cámara no es un adorno. Es una decisión. Montaje, textura, ritmo y verdad.
            Si no hay intención, hay ruido.
          </span>
        }
      />

      <AnchorNav items={navItems} />

      {/* HERO */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{ kind: "image", url: IMG(1012, 2200, 1200), alt: "Film hero (placeholder)" }}
          manifestoTitle="“No grabo para enseñar. Grabo para que se sienta.”"
          manifestoText="Me obsesiona el equilibrio: crudeza y cuidado. Un plano puede ser sucio y aún así estar bien hecho. Si la imagen no respira, da igual lo caro del equipo."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Principios</div>
          <p className="text-zinc-200 font-semibold">
            La historia manda. El look acompaña. El montaje decide.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Trabajo desde el ritmo: primero emoción, luego estética. Y si la estética no sirve a la emoción, se va fuera.
            La cámara es una herramienta para recortar la realidad, no para maquillarla.
          </p>
        </div>
      </section>

      {/* INICIOS */}
      <section id="inicios" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="inicios"
          title="Inicios"
          desc="Cómo entré en el audiovisual y por qué me quedé en el filmmaking."
        />

        <EditorialBlock
          media={{ kind: "image", url: IMG(1030, 1400, 1000), alt: "Inicios 1 (placeholder)" }}
        >
          <p>
            Empecé como empiezan muchos: con hambre, curiosidad y cero permisos. Grababa lo que tenía cerca y aprendía a base
            de prueba-error. Me fascinó algo muy simple: la cámara no captura “lo que hay”, captura lo que tú decides mirar.
          </p>
          <p className="text-zinc-400">
            Con el tiempo entendí que lo mío no era solo “editar bonito”. Era construir una sensación. Cortar, respirar,
            apretar, callar. El montaje como músculo. La luz como tinta.
          </p>
        </EditorialBlock>

        <EditorialBlock
          reverse
          media={{ kind: "image", url: IMG(1036, 1400, 1000), alt: "Inicios 2 (placeholder)" }}
        >
          <p>
            El tattoo me dejó una obsesión: la textura. Y el techno otra: el groove. En cine/vídeo se juntan las dos.
            Si el plano no tiene cuerpo, se nota. Si el ritmo no existe, el espectador se escapa.
          </p>
          <p className="text-zinc-400">
            Mi norte: imágenes crudas, honestas, con intención. El “glitch” solo entra si suma. El color solo entra si cuenta.
          </p>
        </EditorialBlock>
      </section>

      {/* VIDEOCLIPS */}
      <section id="videoclips" className="scroll-mt-24 space-y-6">
        <SectionHeading id="videoclips"  title="Videoclips" desc="Concepto simple, ejecución sólida, montaje al servicio del tema." />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Mi enfoque</div>
          <p className="text-zinc-200 leading-relaxed">
            Un videoclip no es un anuncio. Es una pieza. Si el tema es oscuro, la imagen no puede ir de “bonita”.
            Concepto claro en 1 frase, estética al servicio de la emoción, y montaje que respira con el groove.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Performance + micro-narrativa: gestos, símbolos, textura. Cámara cerca, cuerpo presente, luz con intención.
            Y luego: recortar sin piedad.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {clips.map((v) => (
            <article key={v.id} className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
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
      </section>

      {/* LYRIC */}
      <section id="lyric" className="scroll-mt-24 space-y-6">
        <SectionHeading id="lyric" title="Lyric videos" desc="Tipografía y ritmo: cuando la letra también es un instrumento." />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <p className="text-zinc-200 leading-relaxed">
            Un lyric video bien hecho no es “texto encima”. Es coreografía mínima: timing, jerarquía y respiración.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Editorial/underground: negro, textura, detalle rojo cuando toca clavar el acento.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {lyricVideos.map((v) => (
            <article key={v.id} className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
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
      </section>

      {/* DOC */}
      <section id="doc" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="doc"
          title="Vlogs / Documentales / Entrevistas"
          desc="Plano limpio, audio cuidado, montaje con respeto."
        />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <p className="text-zinc-200 leading-relaxed">
            Prefiero que se entienda, que se escuche, que tenga ritmo sin perder verdad. Si es entrevista, la persona manda.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Estructura: apertura fuerte, contexto mínimo, momentos reales, cierre con intención. Nada de paja.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {docs.map((v) => (
            <article key={v.id} className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
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
      </section>

      {/* VFX */}
      <section id="vfx" className="scroll-mt-24 space-y-6">
        <SectionHeading id="vfx" title="VFX" desc="Integración primero, brillo después." />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <p className="text-zinc-200 leading-relaxed">
            VFX invisible: limpieza, integración, textura coherente. Si hay glitch, que sea rítmico y medido.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Regla: si se nota el truco, hay que hacerlo mejor o quitarlo.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {vfxExamples.map((ex) => (
            <article key={ex.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Antes / Después</div>
                <div className="text-xl font-semibold">{ex.title}</div>
                <p className="text-sm text-zinc-400">{ex.desc}</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                <TattooRevealSlider
                  topImage={ex.before.url}
                  bottomImage={ex.after.url}
                  altTop={ex.before.alt}
                  altBottom={ex.after.alt}
                />

              </div>
            </article>
          ))}
        </div>
      </section>

      {/* GRADING */}
      <section id="grading" className="scroll-mt-24 space-y-6">
        <SectionHeading id="grading" title="Color grading" desc="Look con intención: contraste, piel y negros que respiran." />

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <p className="text-zinc-200 leading-relaxed">
            El color para mí es narrativa. No es “hacerlo bonito”: es decidir qué se siente.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Y cuando voy a blanco y negro, voy a cuchillo: contraste, caída a negro y textura.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {gradingExamples.map((ex) => (
            <article key={ex.id} className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">RAW / GRADE</div>
                <div className="text-xl font-semibold">{ex.title}</div>
                <p className="text-sm text-zinc-400">{ex.desc}</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                <TattooRevealSlider
                  topImage={ex.before.url}
                  bottomImage={ex.after.url}
                  altTop={ex.before.alt}
                  altBottom={ex.after.alt}
                />

              </div>
            </article>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="scroll-mt-24 space-y-6">
        <SectionHeading id="stack" title="Tool stack" desc="Programas que uso y domino según el tipo de proyecto." />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <div key={t.name} className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <div className="text-sm font-semibold text-zinc-100">{t.name}</div>
              <div className="mt-2 text-sm text-zinc-400">{t.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MINI GALERÍA */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading id="galeria" title="Galería" desc="Una muestra rápida. Si te interesa, te mando al canal." />

        <div className="grid gap-4 lg:grid-cols-3">
          {miniGallery.map((v) => (
            <article key={v.id} className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <div className="font-semibold">{v.title}</div>
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
            Ver más en YouTube →
          </a>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto / Booking"
          desc="Videoclips, visuales, piezas documentales, edición, VFX o color. Si quieres algo crudo y bien hecho: hablamos."
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

      {/* Últimos works */}
      {latestFilmWorks.length ? (
        <section className="pt-2 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works</div>
            </div>

            <Link href="/work?type=FILM" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestFilmWorks.map((w) => {
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
      ) : null}
    </main>
  );
}
