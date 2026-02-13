// src/app/tattoo/op-art-pattern-abstraction/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";

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
import TattooRevealSlider from "@/components/evergreen/TattooRevealSlider";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

/**
 * SEO: metadata + canonical + OG/Twitter
 */
const PAGE_TITLE = "Op Art & Pattern-based Abstraction en Madrid · elvasco.x";
const PAGE_DESC =
  "Tatuajes de op art y abstracción basada en patrones: geometría hipnótica, ritmo visual y sistemas construidos línea a línea. Diseño sobre piel, curación guiada y booking directo.";
const CANONICAL = "/tattoo/op-art-pattern-abstraction";

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
 * Helpers simples para placeholders
 */
const IMG = (id: number, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

/**
 * Dos “familias” principales de esta página:
 * - Op Art
 * - Pattern-based Abstraction
 *
 * Estructura tipo “reveal” (arriba textura / abajo tattoo) para que luego metas fotos reales.
 */
const FAMILIES = [
  {
    key: "op-art",
    title: "Op Art",
    subtitle: "Vibración, ilusión de profundidad y movimiento.",
    intro:
      "El op art es ritmo visual puro: líneas, módulos y tensiones que generan vibración. Si se hace bien, no se mira: te mira.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541236/IMG_6341_gxcuio.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541274/IMG_1126_nnll8i.jpg",
    bullets: [
      "Funciona brutal en superficies amplias (brazo, muslo, gemelo) donde el patrón puede “respirar”.",
      "La clave es el contraste y el espaciado: demasiado denso = barro; demasiado suelto = no vibra.",
      "Se construye para el cuerpo real: curvatura, torsión y lectura en movimiento.",
    ],
  },
  {
    key: "pattern-based",
    title: "Pattern-based Abstraction",
    subtitle: "Sistemas visuales. Repetición con intención.",
    intro:
      "Aquí no hay ilustración: hay sistema. Construyo abstracción a partir de módulos repetidos, variaciones mínimas y reglas claras. Es arquitectura en tinta.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541047/Enlight447_rtfrej.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541043/Enlight445_iomzhl.jpg",
    bullets: [
      "Ideal para piezas que crecen con el tiempo: puedes expandir y conectar sin que parezca parche.",
      "Variación micro + regla macro: el patrón no se siente ‘papel pintado’, se siente vivo.",
      "Perfecto para encajar con blackwork/blackout como transición o estructura base.",
    ],
  },
];

/** Mini helper para sacar el cover de un work */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

export default async function OpArtPatternAbstractionPage() {
  /**
   * Works recientes “aproximados”:
   * - Si luego normalizas tags (slug), esta query gana precisión.
   * - Meto OR por slug/nombre para sobrevivir a variaciones.
   */
  const latestPatternWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: {
            OR: [
              { slug: "op-art" },
              { slug: "opart" },
              { slug: "pattern" },
              { slug: "patterns" },
              { slug: "geometric" },
              { slug: "geometry" },
              { slug: "abstract" },
              { slug: "blackwork" },
              { name: "Op Art" },
              { name: "Patterns" },
              { name: "Pattern" },
              { name: "Geometric" },
              { name: "Geometry" },
              { name: "Abstract" },
              { name: "Blackwork" },
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

  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#overview", label: "Visión" },
    { href: "#opart", label: "Op Art" },
    { href: "#patterns", label: "Pattern-based" },
    { href: "#proceso", label: "Proceso" },
    { href: "#recomendaciones", label: "Recomendaciones" },
    { href: "#cuidados", label: "Curación" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Booking" },
  ];

  /**
   * Galería “mosaic”
   */
  const gallery = [
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541051/IMG_1042_dpzafh.jpg", alt: "Op/Pattern 1" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541049/IMG_0967_nfq0be.jpg", alt: "Op/Pattern 2" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541066/IMG_20240109_0004_cikeap.jpg", alt: "Op/Pattern 3" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541061/IMG_9739_s1yyti.jpg", alt: "Op/Pattern 4" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541038/D394FD08-2BE9-450E-AE17-399D385D7E59_ylhrqr.jpg", alt: "Op/Pattern 5" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541035/3BCF293B-299A-424F-A7CA-99DE64458BE3_nu8kix.jpg", alt: "Op/Pattern 6" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541048/Ilustracio%CC%81n_sin_ti%CC%81tulo_graokm.jpg", alt: "Op/Pattern 7" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541041/Enlight444_tbdaej.jpg", alt: "Op/Pattern 8" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541064/IMG_9772_eahblr.jpg", alt: "Op/Pattern 9" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541057/IMG_1332_x8r0sg.jpg", alt: "Op/Pattern 10" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541274/IMG_1126_nnll8i.jpg", alt: "Op/Pattern 11" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541236/IMG_6341_gxcuio.jpg", alt: "Op/Pattern 12" }
  ];

  const mosaicItems: MosaicItem[] = [
    { id: "1", url: gallery[0].url, alt: gallery[0].alt, accent: "bw" },
    { id: "2", url: gallery[1].url, alt: gallery[1].alt, accent: "bw" },
    { id: "3", url: gallery[2].url, alt: gallery[2].alt, accent: "red" },
    { id: "4", url: gallery[3].url, alt: gallery[3].alt, accent: "bw" },
    { id: "5", url: gallery[4].url, alt: gallery[4].alt, accent: "bw" },
    { id: "6", url: gallery[5].url, alt: gallery[5].alt, accent: "bw" },
    { id: "7", url: gallery[6].url, alt: gallery[6].alt, accent: "bw" },
    { id: "8", url: gallery[7].url, alt: gallery[7].alt, accent: "bw" },
    { id: "9", url: gallery[8].url, alt: gallery[8].alt, accent: "red" },
    { id: "10", url: gallery[9].url, alt: gallery[9].alt, accent: "bw" },
    { id: "11", url: gallery[10].url, alt: gallery[10].alt, accent: "red" },
    { id: "12", url: gallery[11].url, alt: gallery[11].alt, accent: "bw" },
  ];

  /**
   * JSON-LD (IA/SEO friendly)
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Tattoo", item: `${siteUrl}/tattoo` },
          {
            "@type": "ListItem",
            position: 3,
            name: "Op Art & Pattern-based Abstraction",
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
        sameAs: ["https://www.instagram.com/elvasco.x", "https://youtube.com/@elvasco.x"],
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}${CANONICAL}#service`,
        name: "Op Art & Pattern-based Abstraction",
        description:
          "Tatuajes de op art y abstracción basada en patrones: geometría hipnótica, ritmo visual y sistemas construidos línea a línea.",
        provider: { "@id": `${siteUrl}/bio#elvasco` },
        areaServed: { "@type": "City", name: "Madrid" },
        serviceType: ["Tattoo", "Op Art Tattoo", "Geometric Tattoo", "Pattern-based Abstraction"],
        availableChannel: [{ "@type": "ServiceChannel", serviceUrl: `${siteUrl}/booking` }],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${CANONICAL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Esto encaja con blackwork o blackout?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Sí. Lo uso mucho como estructura o transición: patrón para construir ritmo, y negro sólido para dar peso. La clave es ajustar densidad y dirección para que el conjunto no se sienta “papel pintado”.",
            },
          },
          {
            "@type": "Question",
            name: "¿Se puede ampliar una pieza con este estilo más adelante?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Es uno de los puntos fuertes. Al ser un sistema modular, se puede crecer y conectar de forma limpia. Planifico bordes y reglas para que el añadido parezca parte del mismo universo.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cómo curo un patrón denso para que no pierda contraste?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Curación en seco al inicio, limpieza suave y no sobrehidratar. En patrones, el exceso de crema puede reblandecer costra y levantar zonas finas. Te doy instrucciones claras y seguimiento.",
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
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Migas */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/tattoo" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Tattoo
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Op Art & Pattern-based Abstraction</span>

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
            OP ART <span className="text-zinc-500">&amp; PATTERN-BASED ABSTRA</span>
            <span className="text-red-500">C</span>
            <span className="text-zinc-500">TION</span>
            </>
        }
        subtitle={
            <>
            Patrones ópticos, <span className="text-zinc-500">geometría ritual</span> y abstracción construida línea a línea.
            </>
        }
        />


      {/* Nav interno sticky */}
      <AnchorNav items={navItems} />

      {/* HERO + manifiesto */}
      <section id="manifiesto" className="scroll-mt-24 space-y-4">
        <HeroMedia
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541445/IMG_9710_vj31ju.jpg",
            alt: "Hero Op Art & Pattern-based Abstraction (placeholder)",
          }}
          manifestoTitle="“No son ilustraciones: son sistemas visuales.”"
          manifestoText="Geometría hipnótica, ritmo visual y abstracción construida a través del patrón. Diseño pensado para cuerpo, no para papel."
        />
      </section>

      {/* BLOQUE breve debajo del hero (lo que pediste) */}
      <section id="overview" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="overview"
          title="Qué es esto (y por qué funciona en piel)"
          desc="Patrón no como decoración, sino como estructura."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767541069/tsuspe12_kh8xk3.jpg",
            alt: "Detalle de patrón geométrico (placeholder)",
          }}
        >
          <p>
            Trabajo con patrones repetitivos y estructuras geométricas que generan vibración, profundidad y movimiento.
            Cada diseño se construye desde el ritmo de la línea, buscando un efecto hipnótico y orgánico, pensado para
            convivir con el cuerpo y su forma.
          </p>

          <p className="text-zinc-400">
            No son ilustraciones: son sistemas visuales. Reglas, variación y lectura. Si el patrón no se adapta a la
            anatomía, se convierte en estampado. Aquí manda el cuerpo.
          </p>

          <p className="text-zinc-400">
            Puedo usarlo como pieza protagonista (op art puro), como estructura para un bodysuit, o como transición entre
            blackwork y negros sólidos. Lo importante es que tenga intención.
          </p>
        </EditorialBlock>
      </section>

      {/* OP ART */}
      <section id="opart" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="opart"
          title="Op Art"
          desc="Ilusión óptica construida con tensión, contraste y repetición."
        />

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="lg:order-1">
            <TattooRevealSlider
              topImage={FAMILIES[0].topImage}
              bottomImage={FAMILIES[0].bottomImage}
              altTop="Op Art texture placeholder"
              altBottom="Op Art tattoo placeholder"
            />
          </div>

          <div className="lg:order-2">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Familia</div>
                <h3 className="text-2xl font-semibold">{FAMILIES[0].title}</h3>
                <p className="text-sm text-zinc-400">{FAMILIES[0].subtitle}</p>
              </div>

              <p className="text-zinc-200">{FAMILIES[0].intro}</p>

              <ul className="space-y-2 text-zinc-400">
                {FAMILIES[0].bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 text-xs text-zinc-500">
                Nota: en op art el “milímetro” importa. Si el patrón se tuerce donde no debe, la vibración se convierte
                en ruido.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATTERN-BASED */}
      <section id="patterns" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="patterns"
          title="Pattern-based Abstraction"
          desc="Abstracción construida por módulos, reglas y variaciones mínimas."
        />

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="lg:order-2">
            <TattooRevealSlider
              topImage={FAMILIES[1].topImage}
              bottomImage={FAMILIES[1].bottomImage}
              altTop="Pattern-based texture placeholder"
              altBottom="Pattern-based tattoo placeholder"
            />
          </div>

          <div className="lg:order-1">
            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Familia</div>
                <h3 className="text-2xl font-semibold">{FAMILIES[1].title}</h3>
                <p className="text-sm text-zinc-400">{FAMILIES[1].subtitle}</p>
              </div>

              <p className="text-zinc-200">{FAMILIES[1].intro}</p>

              <ul className="space-y-2 text-zinc-400">
                {FAMILIES[1].bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 text-xs text-zinc-500">
                Tip: esto es muy “sleeve friendly”. Si quieres crecer el proyecto, este lenguaje te lo pone fácil.
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-900/80" />
      </section>

      {/* PROCESO (igual que otras) */}
      <section id="proceso" className="scroll-mt-24 space-y-6">
        <SectionHeading id="proceso" title="Proceso" desc="Tres pasos. Diseño, sesión y curación. Sin teatro." />

        <ProcessGrid
          steps={[
            {
              title: "Diseño",
              desc:
                "Definimos intención (op art puro vs patrón estructural), zona y escala. Ajusto reglas, densidad y direcciones al cuerpo.",
            },
            {
              title: "Sesión",
              desc:
                "Ritmo, precisión y pausa cuando toca. En patrón lo fino es mantener consistencia sin reventar la piel.",
            },
            {
              title: "Curación",
              desc:
                "Te doy instrucciones claras y seguimiento. La curación manda en los detalles: una buena curación mantiene líneas nítidas y contraste.",
            },
          ]}
        />
      </section>

      {/* RECOMENDACIONES (igual) */}
      <section id="recomendaciones" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="recomendaciones"
          title="Recomendaciones"
          desc="Para que el patrón cure fino y no pierda carácter."
        />

        <ChecklistColumns
          intro="Dos listas rápidas. Lo justo y necesario."
          cols={[
            {
              title: "Preparación previa",
              items: [
                "Dormir bien (patrón + cansancio = sufrimiento)",
                "Comer una comida completa antes de venir",
                "Hidratar la piel los días previos",
                "Evitar alcohol 24h antes",
                "Ropa cómoda y adecuada para la zona",
              ],
            },
            {
              title: "Durante la sesión",
              items: [
                "Comunica si algo quema o se inflama raro",
                "Pausas cortas y frecuentes si hace falta",
                "No tensar mandíbula/hombros (parece broma pero afecta)",
                "Confía en el tempo: en patrón se construye, no se corre",
                "Si mareas o baja azúcar: se para y se come",
              ],
            },
          ]}
        />
      </section>

      {/* CURACIÓN (igual) */}
      <section id="cuidados" className="scroll-mt-24 space-y-6">
        <SectionHeading id="cuidados" title="Curación y cuidados" desc="Vuelves aquí después del tattoo." />

        <CareSteps
          steps={[
            {
              n: "01",
              title: "Primeras 48h",
              text:
                "Curación en seco. Empapador + cambios cada 12h. Limpieza suave para que plasma/tinta no se queden pegados.",
            },
            {
              n: "02",
              title: "Dejar respirar",
              text:
                "Cuando esté limpio y seco, al aire. Evita sobrehidratar al principio: en patrones, demasiada crema puede emborronar el acabado.",
            },
            {
              n: "03",
              title: "Hidratación",
              text:
                "Cuando empiece a pelar, hidrata con muy poco producto. Mejor poco y frecuente que una capa gorda.",
            },
            {
              n: "04",
              title: "Evita castigar la zona",
              text:
                "Nada de sol directo. Nada de piscina/mar 2 semanas. Ropa suelta que no roce.",
            },
            {
              n: "05",
              title: "Timeline",
              text:
                "Curación 4–6 semanas. El contraste se estabiliza mejor hacia 2 meses. Si hace falta, reviso y cierro.",
            },
          ]}
          noteTitle="Si algo te preocupa"
          noteText="Dolor excesivo, calor raro, pus, mal olor, fiebre que no baja o enrojecimiento que se expande: me escribes. Mejor pesada a tiempo que drama tarde."
        />
      </section>

      {/* GALERÍA (igual) */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="galeria"
          title="Galería"
          desc="Mosaic: B/N por defecto, acentos rojos. Hover revela color original. Click abre visor."
        />
        <MosaicGallery items={mosaicItems} title="Op Art & Pattern-based Abstraction" />
      </section>

      {/* BOOKING (igual) */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Booking"
          desc="Si quieres op art o patrones bien construidos, esto se hace con calma y precisión. Tú trae la idea (o la sensación). Yo pongo el sistema."
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

      {/* Últimos works (igual, pero con tags “pattern”) */}
      {latestPatternWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">
                Últimos works: <span className="text-red-500">op · patterns · geometry</span>
              </div>
            </div>

            <Link
              href="/work?tag=geometric"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPatternWorks.map((w) => {
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
