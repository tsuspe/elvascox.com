// app/musica/metal/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import HeroMedia from "@/components/evergreen/HeroMedia";
import MosaicGallery, { type MosaicItem } from "@/components/evergreen/MosaicGallery";
import SectionHeading from "@/components/evergreen/SectionHeading";
import TimelineNav from "@/components/evergreen/TimelineNav";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

/**
 * SEO: metadata + canonical + OG/Twitter
 * (simple, consistente, y “IA friendly”)
 */
const PAGE_TITLE = "Metal · riffs, disciplina y archivo vivo · elvasco.x";
const PAGE_DESC =
  "Metal en el universo elvasco.x: historia personal (guitarra, voz, bajo), discografía, vídeos y galería. Archivo vivo, método y ruido con intención.";
const CANONICAL = "/musica/metal";

const IMG = (id: number, w = 1800, h = 1100) => `https://picsum.photos/id/${id}/${w}/${h}`;
const OG_IMAGE = IMG(1021, 1600, 900);

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: {
    canonical: `${siteUrl}${CANONICAL}`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    url: `${siteUrl}${CANONICAL}`,
    siteName: "elvasco.x",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1600, height: 900, alt: "Metal · elvasco.x" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
    images: [OG_IMAGE],
  },
};

/** Cover helper para works */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

/** Mini helper “tag OR slug/name” (por si tu modelo usa slug o name) */
function tagOr(slugsOrNames: string[]) {
  return {
    OR: slugsOrNames.flatMap((t) => [{ slug: t }, { name: t }]),
  };
}

function VideoCard({
  title,
  desc,
  youtubeId,
}: {
  title: string;
  desc: string;
  youtubeId: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
      <div className="relative aspect-video bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>

      <div className="p-4 space-y-2">
        <div className="text-sm font-semibold">{title}</div>
        <p className="text-sm text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}

function AlbumCard({
  cover,
  band,
  title,
  year,
  role,
  desc,
  links,
}: {
  cover: string;
  band: string;
  title: string;
  year: string;
  role: string;
  desc: string;
  links: { label: string; href: string }[];
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden hover:border-zinc-600 transition">
      <div className="relative aspect-[16/10] bg-black">
        <img src={cover} alt={`${band} - ${title}`} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-4 bottom-4 right-4">
          <div className="text-xs uppercase tracking-wide text-zinc-400">
            {band} · {year} · <span className="text-zinc-300">{role}</span>
          </div>
          <div className="mt-1 text-xl font-semibold leading-tight">{title}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>

        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs rounded-full border border-zinc-700/70 bg-black/40 px-3 py-1 text-zinc-300 hover:border-zinc-500 transition"
            >
              {l.label}
            </a>
          ))}
          <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-zinc-100">
            elvasco.x
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function MetalPage() {
  /**
   * Works relacionados (metal):
   * Ajusta tus tags cuando fijes taxonomía real.
   */
  const latestMetalWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: tagOr([
            "music",
            "musica",
            "metal",
            "metalcore",
            "hardcore",
            "guitar",
            "guitarra",
            "bass",
            "bajo",
            "voice",
            "voz",
            "band",
            "directo",
            "live",
            "studio",
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
    { href: "#historia", label: "Historia" },
    { href: "#discografia", label: "Discografía" },
    { href: "#videos", label: "Vídeos" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Booking" },
  ];

  // Mini mosaic (foto archivo / backstage). Muy contenido para no sobrecargar.
  const gallery: MosaicItem[] = [
    { id: "g1", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634667/IMG_9362_gwtag3.jpg", alt: "Metal archive 1", accent: "bw" },
    { id: "g2", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634664/IMG_2204_i4idyc.jpg", alt: "Metal archive 2", accent: "red" },
    { id: "g3", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634666/IMG_7247_mi34sr.jpg", alt: "Metal archive 3", accent: "bw" },
    { id: "g4", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634664/IMG_7238_dwvnk0.jpg", alt: "Metal archive 4", accent: "bw" },
    { id: "g5", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634663/FCE76ED2-4F2C-45CA-8160-DB8F4C73451E_ruybzk.jpg", alt: "Metal archive 5", accent: "bw" },
    { id: "g6", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634664/IMG_4460_bftdas.jpg", alt: "Metal archive 6", accent: "bw" },
    { id: "g7", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634665/IMG_7242_hxityh.jpg", alt: "Metal archive 7", accent: "red" },
    { id: "g8", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634667/IMG_7268_g0qkts.jpg", alt: "Metal archive 8", accent: "bw" },
    { id: "g9", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634663/493CA4F2-FB25-45FB-9D6D-8C42D0CFDBD1_gwrxgn.jpg", alt: "Metal archive 9", accent: "bw" },
    { id: "g10", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634663/IMG_0730_qkd036.jpg", alt: "Metal archive 10", accent: "bw" },
    { id: "g11", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634663/IMG_0725_izja5m.jpg", alt: "Metal archive 11", accent: "bw" },
    { id: "g12", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767634663/1979D3C1-2829-45A7-98CE-D17C5D1D68AF_zgnphn.jpg", alt: "Metal archive 12", accent: "bw" },
  ];

  // Vídeos demo (IDs reales o placeholder)
  const videos = [
    {
      title: "Thybreath - (Welcome to my Hell) All my Hate (Official video)",
      desc: "Video Official de la cancion ALL MY HATE",
      youtubeId: "1qCSC46tW-0", // cambia por el tuyo
    },
    {
      title: "TSUSPE - AS I LAY DYING - `Redefined´ (BASS COVER)",
      desc: "#asilaydying Bass Cover by TSUSPE",
      youtubeId: "KufzDpKcJRs ",
    },
    {
      title: "MalleficaruM - Rex Noctis - first album promo video",
      desc: "Studio report de la grabación del Primer disco de MalleficaruM - 2010.",
      youtubeId: "C2XDVxY3Vt8",
    },
  ];

  /**
   * JSON-LD (IA/SEO friendly)
   * - BreadcrumbList
   * - WebPage
   * - Person (brand)
   * - CollectionPage (archivo/landing)
   * - FAQPage mínima (sin inventar demasiado)
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Música", item: `${siteUrl}/musica` },
          { "@type": "ListItem", position: 3, name: "Metal", item: `${siteUrl}${CANONICAL}` },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}${CANONICAL}#webpage`,
        url: `${siteUrl}${CANONICAL}`,
        name: PAGE_TITLE,
        description: PAGE_DESC,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "elvasco.x",
          url: `${siteUrl}/`,
        },
        about: [
          { "@type": "Thing", name: "Metal music" },
          { "@type": "Thing", name: "Rock music" },
        ],
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/bio#elvasco`,
        name: "El Vasco",
        url: `${siteUrl}/bio`,
        sameAs: ["https://www.instagram.com/elvasco.x", "https://youtube.com/@elvasco.x"],
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}${CANONICAL}#collection`,
        name: "Metal",
        description:
          "Archivo vivo: historia personal (guitarra, voz, bajo), discografía, vídeos y galería.",
        mainEntity: {
          "@type": "CreativeWorkSeries",
          name: "Metal · elvasco.x",
          creator: { "@id": `${siteUrl}/bio#elvasco` },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${CANONICAL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿De qué va esta página de Metal?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Es un archivo vivo: etapas personales (guitarra, voz, bajo), discografía, vídeos y galería. No es promo; es documentación con método y contexto.",
            },
          },
          {
            "@type": "Question",
            name: "¿Hay música para escuchar aquí?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Sí: hay vídeos y enlaces externos a plataformas. Con el tiempo, el archivo puede crecer con más material y works relacionados.",
            },
          },
          {
            "@type": "Question",
            name: "¿Puedo contactar para colaborar o booking?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Sí: al final tienes acceso a contacto y booking. Si la idea encaja, se concreta por objetivos, tiempos y dirección creativa.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/musica" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Música
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Metal</span>

        {/* micro-link útil */}
        <span className="text-zinc-700">·</span>
        <Link href="/contacto" className="text-zinc-500 hover:text-zinc-200 transition">
          Contacto →
        </Link>
      </div>

      {/* Título brutalista */}
      <header className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Música</div>

        <h1 className="leading-[0.9]">
          <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
            ROCK &
          </span>
          <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
            MET<span className="text-red-500">A</span>L
          </span>
        </h1>

        <div className="max-w-2xl text-zinc-400">
          Archivo vivo. Historia personal, discos, etapas y restos de ruido que aún me sostienen.
        </div>
      </header>

      {/* Nav interno sticky */}
      <AnchorNav items={navItems} />

      {/* HERO + manifiesto */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767631020/IMG_0610_dwwbhl.jpg",
            alt: "Metal hero (placeholder)",
          }}
          manifestoTitle="“El metal fue escuela: disciplina, rabia y método.”"
          manifestoText="Hoy mi foco está en otros frentes, pero el metal fue la base: aprender a repetir hasta que salga, a tocar con intención y a respetar el silencio entre golpes."
        />

        {/* Nota breve, tipo “documental” */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Nota</div>
          <p className="mt-2 text-zinc-400 leading-relaxed max-w-3xl">
            Esta página no pretende ser “promo”. Es un archivo: etapas, bandas, discos y aprendizajes.
            Si alguien encuentra aquí una referencia o un reflejo, perfecto. Si no, también: el metal ya cumplió su trabajo.
          </p>
        </div>
      </section>

      {/* HISTORIA */}
      <section id="historia" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="historia"
          title="Historia"
          desc="Tres etapas: guitarra → voz → bajo. La misma pulsión, distinta herramienta."
        />

        {/* Mini timeline interno SOLO para historia */}
        <TimelineNav
          compact
          sticky
          topClassName="top-28"
          items={[
            { id: "history-inicios", label: "Inicios", hint: "chispa · primeras bandas" },
            { id: "history-guitarra", label: "Guitarra", hint: "riffs & disciplina" },
            { id: "history-voz", label: "Voz", hint: "frontal · intención" },
            { id: "history-bajo", label: "Bajo", hint: "peso · groove" },
          ]}
        />

        {/* Etapa 0 — INICIOS */}
        <div id="history-inicios" className="scroll-mt-48 space-y-6">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Capítulo 0</div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Inicios <span className="text-zinc-500">— ruido, refugio y hambre</span>
            </h3>
            <p className="max-w-2xl text-sm text-zinc-400">
              Antes de la técnica, antes del equipo, antes de saber “hacerlo bien”. Solo la necesidad de tocar algo,
              aunque fuera torpe, aunque fuera feo. La chispa fue esa.
            </p>
          </header>

          <EditorialBlock
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767631107/IMG_5510_pd7o39.jpg",
              alt: "Inicios (placeholder)",
            }}
          >
            <p>
              Aquí empieza todo: casetes quemados, paredes finas, vecinos cabreados, y esa sensación de que la música
              era refugio y arma a la vez. No había “carrera”, había necesidad. Quería pertenecer a algo que sonara
              más fuerte que mi cabeza.
            </p>
            <p className="text-zinc-400">
              Los inicios son torpes pero sagrados: aprendes a escuchar, a aguantar frustración y a confiar en que
              repetir también es crear. Ensayar no era “pasarlo bien”: era una forma de ordenar la vida. Lo que más
              tarde llamé “método”, nació aquí: insistir, afinar, volver, y no romantizar el caos.
            </p>
            <p className="text-zinc-400">
              En retrospectiva, metal fue escuela emocional. Rabia con reglas. Catarsis con disciplina. Y eso, sin
              saberlo, me estaba preparando para todo lo demás: tattoo, film, y cualquier oficio donde el cuerpo paga
              la factura de tus decisiones.
            </p>
          </EditorialBlock>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Nota</div>
            <div className="text-zinc-200 font-semibold leading-snug">
              “El primer ensayo bueno no es cuando suena bien. Es cuando vuelves al día siguiente.”
            </div>
            <p className="text-zinc-400">
              Esta parte es importante: la constancia no nació de la motivación. Nació de la necesidad.
            </p>
          </div>
        </div>

        {/* Etapa 1 — GUITARRA */}
        <div id="history-guitarra" className="scroll-mt-48 space-y-6">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Capítulo I</div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Guitarra <span className="text-zinc-500">— riffs, disciplina y mano derecha</span>
            </h3>
            <p className="max-w-2xl text-sm text-zinc-400">
              Del instinto al control. Del “suena duro” al “camina”. La guitarra fue aprender a construir una idea con
              ritmo, precisión y cuerpo.
            </p>
          </header>

          <EditorialBlock
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767631307/IMG_5523_exjwv5.jpg",
              alt: "Guitarra (placeholder)",
            }}
          >
            <p>
              Empecé como muchos: una guitarra, cero técnica y demasiadas ganas. Al principio era puro instinto:
              riffs que sonaban “duros” aunque estuvieran mal tocados. Luego llegó lo serio: metrónomo, mano derecha,
              limpieza, y entender que la potencia real viene de controlar el golpe, no de apretar más.
            </p>
            <p className="text-zinc-400">
              La guitarra te da una trampa bonita: puedes esconderte detrás de notas o de velocidad. Y esa trampa la
              pagas en directo. Ahí aprendí lo que más tarde repetiría en tattoo: si la base no es sólida, la estética
              es humo. Un riff funciona cuando se sostiene por sí mismo, sin excusas.
            </p>
            <p className="text-zinc-400">
              También fue una etapa de cuerpo. Dolor, callos, tensiones. Aprender a calentar, a respirar, a no romperte
              por ego. Metal enseña que la agresividad no está reñida con el control; de hecho, sin control no hay
              agresividad, hay caos.
            </p>
          </EditorialBlock>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Cita</div>
                <div className="text-zinc-200 font-semibold text-lg leading-snug">
                  “El riff no es una idea: es un cuerpo. Si no camina, no vale.”
                </div>
                <p className="text-zinc-400">
                  Aquí entendí que lo que suena “pesado” no es el volumen: es el timing. Eso en tattoo se traduce igual:
                  lo que se ve “sólido” no es la fuerza: es el método.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Checklist mental</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  <li className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>¿El riff se entiende sin la batería?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>¿Tiene “paso” o es solo notas juntas?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>¿Lo puedes tocar cansado y sigue sonando?</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black">
                <img
                  src={"https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767631398/IMG_7246_pb29th.jpg"}
                  alt="Detalle (placeholder)"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Etapa 2 — VOZ */}
        <div id="history-voz" className="scroll-mt-48 space-y-6">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Capítulo II</div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Voz <span className="text-zinc-500">— frontalidad, intención y presencia</span>
            </h3>
            <p className="max-w-2xl text-sm text-zinc-400">
              Aquí no hay escondite. La voz es tu cara. Si no estás presente, se nota. Si te mientes, se nota el doble.
            </p>
          </header>

          <EditorialBlock
            reverse
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767631643/IMG_0731_muy5fu.jpg",
              alt: "Voz (placeholder)",
            }}
          >
            <p>
              La voz fue el “no hay dónde esconderse”. Con guitarra puedes camuflarte con técnica o con volumen.
              Con voz, si no hay intención, se nota en dos segundos. Fue una etapa de presencia: respirar, frasear,
              controlar, sostener un directo sin reventarte.
            </p>
            <p className="text-zinc-400">
              También fue una etapa de identidad. Encontrar un tono que no imitara a nadie. Aprender a no confundir
              agresividad con autenticidad. Y entender que el silencio pesa: a veces el momento más heavy es el que
              no gritas.
            </p>
            <p className="text-zinc-400">
              Me dejó una lección que uso hoy en todo: lo que emociona no es lo perfecto, es lo verdadero. Un grito
              sin intención es postureo. Una frase bien colocada, aunque sea simple, puede partir un tema por la mitad.
            </p>
          </EditorialBlock>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Acustico</div>
            <p className="text-zinc-400 leading-relaxed">
              Aunque mi paso como cantante a nivel publico fue muy breve, nunca he dejado de componer y cantar para mi, con mis proyectos en acustico.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lo que aprendí</div>
              <div className="mt-2 text-zinc-200 font-semibold">Respirar es ritmo</div>
              <p className="mt-2 text-sm text-zinc-400">
                El fraseo manda. Si no respiras bien, no hay groove. Y sin groove, no hay verdad.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lo que desaprendí</div>
              <div className="mt-2 text-zinc-200 font-semibold">Gritar por gritar</div>
              <p className="mt-2 text-sm text-zinc-400">
                La violencia sin intención es cartón piedra. El silencio bien puesto es dinamita.
              </p>
            </div>
          </div>
        </div>

        {/* Etapa 3 — BAJO */}
        <div id="history-bajo" className="scroll-mt-48 space-y-6">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-zinc-500">Capítulo III</div>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Bajo <span className="text-zinc-500">— peso, espacio y madurez</span>
            </h3>
            <p className="max-w-2xl text-sm text-zinc-400">
              Menos exhibición, más soporte. El bajo es el “negro” de la música: masa, lectura, decisión.
            </p>
          </header>

          <EditorialBlock
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767632025/IMG_2603_qmhvqn.jpg",
              alt: "Bajo (placeholder)",
            }}
          >
            <p>
              El bajo fue la etapa más “adulto”. Menos exhibición, más soporte. Aprendí a escuchar a batería de verdad,
              a construir peso y movimiento con pocas notas, y a dejar espacio cuando el tema lo pedía.
            </p>
            <p className="text-zinc-400">
              El bajo también es textura. Eso conecta con mi estética actual: el negro como masa, como lectura, como
              decisión de diseño. En metal, el bajo hace que todo parezca más grande sin decir “mírame”. Ese concepto
              se me quedó tatuado (literalmente).
            </p>
            <p className="text-zinc-400">
              Aquí aparece algo clave: el gusto por lo invisible. Lo que sostiene sin pedir aplauso. En un tema, si el
              bajo está bien, nadie lo comenta… pero si está mal, el edificio se cae. Eso es oficio.
            </p>
          </EditorialBlock>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lección</div>
              <div className="mt-2 font-semibold">Tocar para el tema</div>
              <p className="mt-2 text-sm text-zinc-400">Menos notas. Más intención. Más aire.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lección</div>
              <div className="mt-2 font-semibold">Groove = narrativa</div>
              <p className="mt-2 text-sm text-zinc-400">La violencia sin groove es cartón piedra.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Lección</div>
              <div className="mt-2 font-semibold">Consistencia</div>
              <p className="mt-2 text-sm text-zinc-400">Directo, estudio y cabeza: lo mismo.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Cierre de historia</div>
            <p className="text-zinc-200 font-semibold">La herramienta cambió. La pulsión no.</p>
            <p className="text-zinc-400">
              Metal fue pasado, sí… pero no “algo que se dejó”. Es una capa. Una forma de disciplina. Una manera de
              entender el peso, el contraste y el oficio. Y esas tres cosas siguen vivas en todo lo que hago.
            </p>
          </div>
        </div>
      </section>

      {/* DISCOGRAFÍA */}
      <section id="discografia" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="discografia"
          title="Discografía"
          desc="Discos y etapas. Portadas como entrada rápida; detalles tipo “bio documental” si te apetece bajar al barro."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              band: "THYBREATH",
              year: "2019",
              role: "BAJO",
              title: "My Own Hell",
              cover: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767632324/2026-01-05_17-58_panway.png",
              blurb:
                "Tercer disco de la banda THYBREATH (Madrid) tuve el honor de tocar con ellos en varios conciertos y festivales durante mis 5 años en la banda.",
              links: [
                { label: "Spotify", href: "https://open.spotify.com/intl-es/album/4UznRALi9BP0PrPlJT4iBy?si=HGCeeEoFTtma_9jH9d4YnA" },
                { label: "Apple Music", href: "https://music.apple.com/es/album/my-own-hell/1458900227" },
                { label: "YouTube", href: "https://www.youtube.com/watch?v=YZEhDwSB_P0&list=OLAK5uy_mRy0EwawKvYg30dY04F6SybEGGZ9bJouM" },
              ],
              highlight: { label: "Tema destacado", value: "04 - Dust" },
              credits: ["Guitarras: Ivan `Aizkora´ y Dima", "Batería: Rul ", "Voz: Victor", "Bajo: Tsuspe (ElVasco.X)"],
              tracklist: ["Elcome To My Hell", "All My Hate", "Paranoia", "Dust", "The Sea Of Death", "Bloodshot Eyes", "The Crab", "Tears for Blood", "Shut Up", "Dead Flesh", "Horizons", "Shot - Bonus Track"],
              anecdote:
                "Grabamos el Bajo en un solo dia!!.",
            },
            {
              band: "MALLEFICARUM",
              year: "2011",
              role: "GUITARRA y VOZ",
              title: "MalleficaruM",
              cover: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767633274/2026-01-05_18-14_cdoxxx.png",
              blurb:
                "MalleficaruM fue mi proyecto predilecto desde que lo cree, creamos una historia mezclando historia real con ficcion, un disco conceptual 60min de musica contando una historia.",
              links: [
                { label: "Spotify", href: "https://open.spotify.com/intl-es/album/0Emjqm5nIHMQ5w8HR4kIz7?si=ILSICDoxTKCvjnTPp-8qgA" },
                { label: "Apple Music", href: "https://music.apple.com/us/album/malleficarum/476914560" },
                { label: "YouTube", href: "https://www.youtube.com/watch?v=y3OV8vayobE&list=OLAK5uy_n-i_gbKxxd387qRH9S0ep4FhbB61_h5RU" },
              ],
              highlight: { label: "Tema destacado", value: "03 · Rex Noctis" },
              credits: ["Voz: Puñales", "Guitarras: Roy", "Bajo: Danny Lamberg", "Bateria: Alfred Berengena", "Guitarra y Voz: Tsuspe (ElVAscox)"],
              tracklist: ["In Nomine Satanas", "We Refuse To See", "Rex Noctis", "Hate Unleashed", "Maleficio (Curse)", "Death Evocation", "Dark Messiah", "Cultus MalleficaruM", "Lord Of Existance", "The Omen", "Made In Hell"],
              anecdote:
                "Fuimos a grabar el disco a Italia, fue divertido...",
            },
            {
              band: "NOX INTERNA",
              year: "2011",
              role: "GUITARRA",
              title: "The Seeds Of Disdain",
              cover: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767633997/2026-01-05_18-26_mjpzh1.png",
              blurb:
                "Realmente no llegue a grabr el disco, tras meses de composicion y preparacion, justo cuando ibamos a entrar al estudio a grabar este disco, el grupo se traslado a Alemania y me quede fuera",
              links: [
                { label: "Spotify", href: "https://open.spotify.com/intl-es/album/5022zsBhphFqiRWXRFnE1D?si=DkqXuU63R8C409oT7rwM7w" },
                //{ label: "Apple Music", href: "https://music.apple.com" },
                { label: "YouTube", href: "https://www.youtube.com/watch?v=tNpZXfGnlGs&list=OLAK5uy_mUa4iE4Vbak1fHrj7PTczVYGbWPw4lsBg" },
              ],
              highlight: { label: "Tema destacado", value: "10 · El Lobo Estepario" },
              credits: ["Voz: Richy Nox", "Batería: Pablo", "Guitarras: Tsuspe (ElVasco.X)", "Bajo: Danny Lamberg", "Teclados. Bea"],
              tracklist: ["Prelude", "Pray", "Our Last Song", "Rechazo de Sueños", "Misery", "Born Under Saturns Sign", "Abismo", "iḿ Sick", "Too Sweet", "El Lobo Estepario", "1984", "Victory Of Love (Alphaville Cover)", "The Seeds Of Disdain"],
              anecdote:
                "Aunque no llegue a grabar el disco, algunos de los riffs son los que grabe en la maqueta",
            },
          ].map((d) => (
            <article
              key={`${d.title}-${d.year}`}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-black/30 hover:border-zinc-600 transition"
            >
              {/* Cover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:opacity-95 transition"
                  style={{ backgroundImage: `url(${d.cover})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                <div className="relative p-5">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">
                    {d.band} · {d.year} · <span className="text-zinc-200">{d.role}</span>
                  </div>
                  <div className="mt-2 text-2xl font-semibold leading-tight">{d.title}</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-zinc-300 leading-relaxed">{d.blurb}</p>

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  {d.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-zinc-800 bg-black/40 px-3 py-1 text-xs text-zinc-200 hover:border-zinc-600 transition"
                    >
                      {l.label}
                    </a>
                  ))}
                  <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-zinc-100">
                    elvasco.x
                  </span>
                </div>

                {/* Expand */}
                <details className="rounded-xl border border-zinc-800 bg-black/30 open:bg-black/40 transition">
                  <summary className="cursor-pointer list-none px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-200">
                        Ver detalles (tracklist · créditos · anécdota)
                      </div>
                      <div className="text-xs text-zinc-500 group-open:text-zinc-300 transition">
                        desplegar
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {d.highlight.label}: <span className="text-zinc-300">{d.highlight.value}</span>
                    </div>
                  </summary>

                  <div className="px-4 pb-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Tracklist */}
                      <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Tracklist</div>
                        <ol className="mt-2 space-y-1 text-sm text-zinc-300">
                          {d.tracklist.map((t, i) => (
                            <li key={t} className="flex gap-2">
                              <span className="text-zinc-600">{String(i + 1).padStart(2, "0")}.</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Créditos */}
                      <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Créditos</div>
                        <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                          {d.credits.map((c) => (
                            <li key={c} className="flex gap-2">
                              <span className="mt-2 inline-block h-1 w-1 rounded-full bg-red-500/80" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Anecdota */}
                    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Anécdota</div>
                      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{d.anecdote}</p>
                    </div>

                    {/* CTA mini */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-zinc-500">
                        Tip: esto luego puede alimentarse de tu modelo <span className="text-zinc-300">Work</span> si
                        quieres automatizarlo.
                      </div>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-zinc-800 bg-black/40 px-4 py-2 text-xs text-zinc-200 hover:border-zinc-600 transition"
                      >
                        Escuchar destacado →
                      </a>
                    </div>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>

        {/* Nota / idea */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Idea opcional</div>
          <p className="mt-2 text-zinc-400 leading-relaxed">
            Si te mola aún más “bio documental”: cada disco podría tener una mini foto de época dentro del desplegable,
            y un bloque “Mi rol en este disco” (2 líneas). Pero así, con 3 cards + detalles, ya se entiende y no
            sobrecarga.
          </p>
        </div>
      </section>

      {/* VÍDEOS */}
      <section id="videos" className="scroll-mt-24 space-y-6">
        <SectionHeading id="videos" title="Vídeos" desc="Playthroughs, directos, backstage. Pocas piezas, bien elegidas." />

        <div className="grid gap-4 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.youtubeId} title={v.title} desc={v.desc} youtubeId={v.youtubeId} />
          ))}
        </div>

        <div className="flex justify-end">
          <a
            href="https://www.youtube.com/watch?v=PzsKz-PVs5I&list=PLjx2lu7j9eLyFUh5OGNBn3extyZcZzq23"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-700 bg-black/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
          >
            Ver más en YouTube →
          </a>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading id="galeria" title="Galería" desc="Archivo visual. Una sola mosaic, sin convertir esto en un carrusel infinito." />
        <MosaicGallery items={gallery} title="Metal archive (placeholder)" />
      </section>

      {/* BOOKING / CONTACTO */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Contacto / Booking"
          desc="Si quieres hablar de música, colaborar o rescatar material antiguo con sentido, aquí estoy. Sin postureo: ideas claras."
          primaryHref="/contacto"
          primaryLabel="Contacto"
          secondaryHref="/booking"
          secondaryLabel="Booking"
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
      {latestMetalWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">Últimos works relacionados</div>
            </div>

            <Link
              href="/work?tag=metal"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestMetalWorks.map((w) => {
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
