// src/app/tattoo/blackout/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import AnchorNav from "@/components/evergreen/AnchorNav";
import CareSteps from "@/components/evergreen/CareSteps";
import ChecklistColumns from "@/components/evergreen/ChecklistColumns";
import CTABox from "@/components/evergreen/CTABox";
import EditorialBlock from "@/components/evergreen/EditorialBlock";
import HeroMedia from "@/components/evergreen/HeroMedia";
import MosaicGallery, { type MosaicItem } from "@/components/evergreen/MosaicGallery";
import ProcessGrid from "@/components/evergreen/ProcessGrid";
import SectionHeading from "@/components/evergreen/SectionHeading";
import SectionTitle from "@/components/evergreen/SectionTitle";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

const PAGE_TITLE = "Blackout Tattoo en Madrid · elvasco.x";
const PAGE_DESC =
  "Blackout tattoo con lectura del cuerpo: negro sólido, ritmo y curación bien hecha. Proyectos grandes con calma, diseño sobre piel y seguimiento real. Booking directo.";
const CANONICAL = "/tattoo/blackout";

/**
 * SEO: metadata + canonical + OG/Twitter
 * (sin inventarnos datos raros: simple y consistente)
 */
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
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESC,
  },
};

/**
 * MediaItem: estructura mínima para tus placeholders.
 * (En tu proyecto real seguramente esto viene de Prisma/DB para works.)
 */
type MediaItem = {
  id?: string;
  kind: "image" | "video";
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  isCover?: boolean | null;
  order?: number | null;
};

function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

export default async function BlackoutPage() {
  /**
   * 1) Works recientes con tag blackout (bloque final “actualidad”)
   * - Esto sí es DB-driven, porque Works = batallero/IG interno.
   * - Ojo: si todavía no tienes tags/slug, este bloque quedará vacío.
   */
  const latestBlackoutWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: {
            OR: [
              { slug: "blackout" },
              { name: "Blackout" },
              // extras “por si acaso” (no rompe nada)
              { slug: "black-out" },
              { name: "blackout" },
            ],
          },
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

  /**
   * 2) HERO placeholder
   * Cuando tengas un vídeo: cambia kind:"video" y url al mp4.
   */
  const heroMedia: MediaItem = {
    kind: "image",
    url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525628/IMG_8756_y6skrg.jpg",
    alt: "Blackout hero",
  };

  /**
   * 3) Galería base (10 items)
   * Esto lo cambias tú con tus fotos reales.
   */
  const gallery: MediaItem[] = [
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525628/IMG_8334_yrdzsr.jpg",
      alt: "Blackout 1",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525626/IMG_8316_gazgue.jpg",
      alt: "Blackout 2",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525627/IMG_8275_zk5mp4.jpg",
      alt: "Blackout 3",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525625/IMG_7936_bxypsq.jpg",
      alt: "Blackout 4",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525617/IMG_0605_edt5bu.jpg",
      alt: "Blackout 5",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525632/IMG_9178_oavm9g.jpg",
      alt: "Blackout 6",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525620/IMG_3940_mwbrlo.jpg",
      alt: "Blackout 7",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525612/54BF8ACE-92ED-4DBC-8103-3ADA608937D9_cs4cac.jpg",
      alt: "Blackout 8",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525613/F2F44074-345E-447F-8910-380B47E0CF78_ngw52m.jpg",
      alt: "Blackout 9",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525612/8CD9CEFA-3684-4793-9A96-124367BE5320_xnxys6.jpg",
      alt: "Blackout 10",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525616/IMG_0104_rofaei.jpg",
      alt: "Blackout 11",
    },
    {
      kind: "image",
      url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525620/IMG_2143_oqhjgj.jpg",
      alt: "Blackout 12",
    }
  ];

  /**
   * 4) Mosaic items
   * - “bw” para la mayoría
   * - 1–2 “red” para acentos
   */
  const mosaicItems: MosaicItem[] = [
    { id: "1", url: gallery[0].url, alt: "Blackout 1", accent: "bw" },
    { id: "2", url: gallery[1].url, alt: "Blackout 2", accent: "red" },
    { id: "3", url: gallery[2].url, alt: "Blackout 3", accent: "red" }, // ROJO
    { id: "4", url: gallery[3].url, alt: "Blackout 4", accent: "bw" },
    { id: "5", url: gallery[4].url, alt: "Blackout 5", accent: "bw" },
    { id: "6", url: gallery[5].url, alt: "Blackout 6", accent: "bw" },
    { id: "7", url: gallery[6].url, alt: "Blackout 7", accent: "bw" },
    { id: "8", url: gallery[7].url, alt: "Blackout 8", accent: "bw" },
    { id: "9", url: gallery[8].url, alt: "Blackout 9", accent: "red" }, // ROJO
    { id: "10", url: gallery[9].url, alt: "Blackout 10", accent: "bw" },
      { id: "11", url: gallery[10].url, alt: "Blackout 11", accent: "bw" },
  { id: "12", url: gallery[11].url, alt: "Blackout 12", accent: "bw" },
  ];

  /**
   * 5) Anchor nav
   * Ojo: si tu nav global es sticky, quizá haya que ajustar:
   * - AnchorNav: top-16
   * - SectionHeading: scroll-mt-32
   * para que no tape títulos al navegar.
   */
  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#vision", label: "Cómo lo vivo" },
    { href: "#neotribal", label: "Neotribal" },
    { href: "#proceso", label: "Proceso" },
    { href: "#recomendaciones", label: "Recomendaciones" },
    { href: "#cuidados", label: "Curación" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Booking" },
  ];

  /**
   * JSON-LD (IA/SEO friendly)
   * - Service: blackout tattoo
   * - BreadcrumbList: estructura de navegación
   * - FAQPage: basado en tu propio contenido (sin inventar)
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tattoo",
            item: `${siteUrl}/tattoo`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Blackout",
            item: `${siteUrl}${CANONICAL}`,
          },
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
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/bio#elvasco`,
        name: "El Vasco",
        url: `${siteUrl}/bio`,
        sameAs: [
          "https://www.instagram.com/elvasco.x",
          "https://youtube.com/@elvasco.x",
        ],
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}${CANONICAL}#service`,
        name: "Blackout Tattoo",
        description:
          "Blackout tattoo con diseño sobre piel, negro sólido y enfoque en curación y seguimiento.",
        provider: { "@id": `${siteUrl}/bio#elvasco` },
        areaServed: {
          "@type": "City",
          name: "Madrid",
        },
        serviceType: ["Tattoo", "Blackout Tattoo"],
        availableChannel: [
          {
            "@type": "ServiceChannel",
            serviceUrl: `${siteUrl}/booking`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${CANONICAL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cuánto tarda en curar un blackout?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "La curación completa suele estar en 4–6 semanas, y el color se estabiliza mejor hacia los 2 meses. Ahí es cuando tiene sentido revisar y cerrar posibles zonas más claras.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué hago las primeras 48 horas?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Curación en seco: empapador y cambios cada 12h, con limpieza bien hecha para que tinta/plasma/sangre no se queden pegados. Mantenerlo limpio y seco es clave al principio.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuándo empiezo a hidratar?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Cuando empiece a pelar, hidrata con tu crema habitual o aceite de coco, siempre con la zona limpia. Al principio evita mantener la herida húmeda si puede atrapar polvo o pelusas.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-10">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/tattoo" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Tattoo
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Blackout</span>

        {/* micro-links internos (IA-friendly, sin molestar UI) */}
        <span className="text-zinc-700">·</span>
        <Link
          href="/booking"
          className="text-zinc-500 hover:text-zinc-200 transition"
          aria-label="Ir a Booking"
        >
          Booking →
        </Link>
      </div>

      <SectionTitle
        title={
          <>
            BLACK <span className="text-zinc-500">O</span>
            <span className="text-red-500">U</span>
            <span className="text-zinc-500">T</span>
          </>
        }
        subtitle={
          <>
            Negro sólido. <span className="text-zinc-500">Lectura del cuerpo.</span> Ritmo, contraste y paciencia.
          </>
        }
      />


      {/* Nav interno */}
      <AnchorNav items={navItems} />

      {/* HERO + manifiesto */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{ kind: heroMedia.kind, url: heroMedia.url, alt: heroMedia.alt }}
          manifestoTitle={
            <>
              El BLACKOUT mezcla lo más punk con lo más delicado,
              <br />
              <span className="opacity-80">“No design – Just Black.”</span>
            </>
          }
          manifestoText="El tatuaje más anti-tatuaje."
        />


        {/* micro-CTA bajo hero (sin cargarlo) */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/booking"
            className="rounded-full border border-zinc-800 bg-black/20 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
          >
            Booking →
          </Link>
          <Link
            href="/work?type=TATTOO"
            className="rounded-full border border-zinc-800 bg-black/20 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Ver trabajos →
          </Link>
        </div>
      </section>

      {/* Visión / texto editorial con imágenes */}
      <section id="vision" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="vision"
          title="Qué es para mí el blackout"
          desc="Esto no es un texto largo: es un ensayo visual. Párrafos cortos, aire, y media intercalada."
        />

        <EditorialBlock media={{ kind: "image", url: gallery[8].url, alt: gallery[1].alt }}>
          <p>
            Me gusta involucrarme al 100% en los trabajos que vamos a realizar, tanto en el diseño como
            en el proceso del tatuaje como en la curación. El compromiso es completo por ambas partes,
            ya que es un trabajo que va a perdurar para siempre en tu piel.
          </p>
          <p className="text-zinc-400">
            Yo lo hago, pero tú lo aguantas. Es algo que va a llevar mi nombre para siempre y quiero
            que tú lo lleves con orgullo siempre.
          </p>
          <p className="text-zinc-400">
            Huyo del planteamiento comercial de muchos estudios: cola, prisa, 10 camillas en fila.
            Los proyectos grandes son ritual. Tú marcas tiempos, pausas y necesidades. Por eso trabajo
            en espacios privados.
          </p>
        </EditorialBlock>

        <EditorialBlock reverse media={{ kind: "image", url: gallery[3].url, alt: gallery[4].alt }}>
          <p>
            Para el diseño me sirve todo: diseños que hayas visto, otros tatuajes, fotos, películas,
            frases, canciones, pinturas… cualquier cosa que te haga vibrar.
          </p>
          <p className="text-zinc-400">
            Normalmente el proceso arranca sobre una fotografía de la zona, pero el diseño final se hace
            sobre la piel: adaptar a curvas reales, proporciones y al cuerpo en movimiento.
          </p>
          <p className="text-zinc-400">
            Si el proyecto es grande, a veces el primer día es solo diseño sobre piel. Te vas a casa,
            lo sientes, lo miras, y al día siguiente rematamos. Esto lo vas a vestir toda la vida.
          </p>
        </EditorialBlock>

        {/* NEOTRIBAL */}
        <div className="pt-6 space-y-6">
          <SectionHeading
            id="neotribal"
            title="NEOTRIBAL"
            desc="Un espacio aparte. Mis reglas, mi lectura, y por qué me interesa cuando se hace con intención."
          />

          <EditorialBlock
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525632/IMG_9166_dz37nu.jpg",
              alt: "Neotribal — placeholder",
            }}
          >
            <p>
              Placeholder: aquí explicas tu visión del neotribal (ritmo, flow, cuerpo en movimiento,
              contraste, respiración, zonas de descanso). Mantén párrafos cortos.
            </p>
            <p className="text-zinc-400">
              Placeholder: referencias (sin nombrar demasiado), idea de “ornamento agresivo pero elegante”.
            </p>
          </EditorialBlock>

          <EditorialBlock
            reverse
            media={{
              kind: "image",
              url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767525615/Ilustracio%CC%81n_sin_ti%CC%81tulo_qln928.jpg",
              alt: "Neotribal — placeholder 2",
            }}
          >
            <p>
              Placeholder: cómo lo planteas tú: diseño sobre piel, adaptación muscular, lectura anatómica,
              y por qué no lo haces “por rellenar”.
            </p>
            <p className="text-zinc-400">
              Placeholder: mini lista de “principios” (3 bullets) con mucho aire.
            </p>
          </EditorialBlock>
        </div>

        {/* Callout de cierre editorial */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
          <p className="text-zinc-200 font-semibold">Confiar en el proceso.</p>
          <p className="mt-2 text-zinc-400 leading-relaxed">
            Los tatuajes a gran escala son carrera de fondo. El blackout no se ve fino hasta que queda cerrado.
            El proceso puede ser duro (tinta, plasma, inflamación, piel seca, pellejos, defensas bajas).
            Por eso: comunicación y cabeza.
          </p>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="scroll-mt-24 space-y-6">
        <SectionHeading id="proceso" title="Proceso" desc="Tres pasos, claros y visuales: diseño, sesión y curación." />

        <ProcessGrid
          steps={[
            {
              title: "Diseño",
              desc:
                "Referencias + lectura del cuerpo. El diseño se adapta a ti, no al revés. Potenciar curvas, proporciones y movimiento.",
            },
            {
              title: "Sesión",
              desc:
                "Sesiones intensas. Pausas, comunicación y ritmo. No es una carrera: buscamos negro sólido y buena curación.",
            },
            {
              title: "Curación",
              desc:
                "Aquí se gana el resultado final. Seguimiento y revisión. Revisión a los 2 meses para cerrar imperfecciones.",
            },
          ]}
        />
      </section>

      {/* Recomendaciones */}
      <section id="recomendaciones" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="recomendaciones"
          title="Recomendaciones"
          desc="Negro grande = cuerpo trabajando. Aquí lo importante, sin paja."
        />

        <ChecklistColumns
          intro="Te dejo dos listas: preparación previa y durante la sesión."
          cols={[
            {
              title: "Preparación previa",
              items: [
                "Descansar bien la noche anterior",
                "Comer una comida completa antes de la sesión",
                "Hidratar la piel los días previos",
                "Evitar alcohol y drogas 24h antes",
                "Usar ropa cómoda y adecuada",
              ],
            },
            {
              title: "Durante la sesión",
              items: [
                "Ropa cómoda pensando en la zona",
                "Mantener comunicación constante",
                "Tomar descansos cuando sea necesario",
                "Mantener niveles de azúcar estables",
                "Respirar profundo, relajarse y confiar en el proceso",
              ],
            },
          ]}
        />
      </section>

      {/* Curación y cuidados */}
      <section id="cuidados" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="cuidados"
          title="Curación y cuidados"
          desc="Esta sección es funcional: la uso para redirigirte después del tattoo. Mejor clara que poética."
        />

        <CareSteps
          steps={[
            {
              n: "01",
              title: "Primeras 48h",
              text:
                "Curación en seco. Empapador + cambios cada 12h. Limpieza bien hecha para que lo que expulse (tinta/plasma/sangre) no se quede pegado a la piel.",
            },
            {
              n: "02",
              title: "Dejar respirar",
              text:
                "Cuando esté limpio y seco, al aire. Evita cremas/aceites al principio: mantener la herida húmeda puede atrapar polvo, pelusas o pelos y complicar la curación.",
            },
            {
              n: "03",
              title: "Hidratación",
              text:
                "Cuando empiece a pelar, hidrata con tu crema habitual o aceite de coco. Siempre con la zona limpia.",
            },
            {
              n: "04",
              title: "Movilidad y agenda",
              text:
                "Se inflama, sobre todo las primeras 48h. Puede bajar la energía y reducir movilidad. Organiza tu agenda para descansar, ropa suelta y evitar roces o esfuerzo.",
            },
            {
              n: "05",
              title: "Timeline",
              text:
                "Curación completa 4–6 semanas. El color se estabiliza mejor hacia los 2 meses. Revisión/repaso para cerrar posibles zonas más claras.",
            },
          ]}
          noteTitle="Si algo te preocupa"
          noteText="Dolor excesivo, calor raro, pus, mal olor, fiebre que no baja o enrojecimiento que se expande: me escribes. Prefiero que me des la turra a que te hagas el héroe."
        />
      </section>

      {/* Galería */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="galeria"
          title="Galería"
          desc="Mosaic elegante: B/N por defecto, dos acentos en rojo. Hover revela el color original. Click abre visor."
        />

        <MosaicGallery items={mosaicItems} title="Blackout" />
      </section>

      {/* Booking */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Booking"
          desc="Si quieres blackout, ven con intención y con tiempo. Lo demás lo afinamos juntos."
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

      {/* Últimos works con tag blackout */}
      {latestBlackoutWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">
                Últimos works con tag <span className="text-red-500">blackout</span>
              </div>
            </div>

            <Link href="/work?tag=blackout" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestBlackoutWorks.map((w) => {
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
                        <span className="text-zinc-600"> · {new Date(w.publishedAt).toLocaleDateString()}</span>
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
