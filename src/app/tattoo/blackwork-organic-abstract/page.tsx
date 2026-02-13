// src/app/tattoo/abstract-organic-blackwork/page.tsx
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
 * (simple, consistente, y “IA friendly”)
 */
const PAGE_TITLE = "Abstract Organic Blackwork en Madrid · elvasco.x";
const PAGE_DESC =
  "Blackwork orgánico y abstracto: texturas vivas, flow y adaptación total al cuerpo. Diseño sobre piel, sesiones con cabeza y curación bien guiada. Booking directo.";
const CANONICAL = "/tattoo/abstract-organic-blackwork";

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
 * - Luego sustituyes por Cloudinary / tus assets reales
 */
const IMG = (id: number, w = 1600, h = 1000) => `https://picsum.photos/id/${id}/${w}/${h}`;

/**
 * Texturas base para esta página:
 * - topImage: foto de "textura" (agua, tinta, grieta…)
 * - bottomImage: "tattoo" placeholder (luego lo cambias por tus fotos reales)
 */
const TEXTURES = [
  {
    key: "suminagashi",
    title: "Suminagashi",
    subtitle: "Mármol líquido. Agua, tinta y respiración.",
    intro:
      "El suminagashi no es un patrón: es una corriente. La gracia está en dejar que parezca vivo, sin convertirse en papel pintado.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767536304/IMG_2652_jq6vh1.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767536745/IMG_9781_ierf3j.jpg",
    bullets: [
      "Funciona brutal en zonas amplias donde el flow puede “andar” (brazos, muslo, espalda).",
      "El secreto está en las pausas: dejar aire para que el negro respire.",
      "Dirección > detalle. Si el cuerpo gira, la textura tiene que girar con él.",
    ],
  },
  {
    key: "brushes",
    title: "Brushes",
    subtitle: "Gesto directo. Velocidad y peso del trazo.",
    intro:
      "Aquí mando yo con el pulso. Son trazos que parecen rápidos, pero están colocados con intención: empuje, frenada, arrastre, silencio.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767537078/E42BB1B4-BA1E-4462-B028-992D8580904C_pd2ufq.png",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767537220/407E3A45-5F17-4E4A-899B-02495A9187A6_nfzrex.jpg",
    bullets: [
      "Se leen a distancia: presencia desde lejos y textura de cerca.",
      "Contraste entre trazo seco y negro sólido.",
      "Si todo es agresivo, no hay música: meto respiraciones para que el ojo descanse.",
    ],
  },
  {
    key: "ink-splashes",
    title: "Ink splashes",
    subtitle: "Impacto. Caos controlado.",
    intro:
      "Salpicadura no significa aleatorio. Es energía dirigida: dónde cae la tensión, dónde se rompe, dónde se apaga.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767538272/IMG_1334_slwnu4.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767537783/copy_of_img_3254_f4wncs_6efeb5.jpg",
    bullets: [
      "Perfecto como acento para romper una composición demasiado limpia.",
      "Si lo haces sin control, ensucia. Si lo haces con intención, firma.",
      "Estas zonas suelen pelar fuerte: te explico cómo cuidarlo para que no pierda carácter.",
    ],
  },
  {
    key: "cracks",
    title: "Cracks",
    subtitle: "Grieta. Tensión. Piedra.",
    intro:
      "Me flipa la textura seca: ese ‘crack’ que parece que la piel tiene historia. Aquí la anatomía manda: la grieta tiene que seguir la estructura del cuerpo.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767538694/IMG_20240416_0002_ff1wno.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767538766/DSC04626_gnd19n.jpg",
    bullets: [
      "Ideal en zonas con tensión natural (hombro, pectoral, gemelo).",
      "Densidad variable para que no quede ‘mosaico uniforme’.",
      "Lo fino: orgánico de verdad, no “plantilla de grietas”.",
    ],
  },
  {
    key: "filaments",
    title: "Filaments",
    subtitle: "Hilos. Nervio. Electricidad orgánica.",
    intro:
      "Los filamentos conectan. Guían la mirada y cosen piezas distintas. Si el cuerpo es un mapa, esto son rutas.",
    topImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767538896/IMG_8714_qgw9ml.jpg",
    bottomImage: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767539027/IMG_4993_nfedhv.jpg",
    bullets: [
      "Sirven para unir blackwork con zonas sólidas sin que se vea ‘corte’.",
      "Zonas de densidad y zonas de casi-nada: ahí vive el contraste.",
      "En movimiento se leen muy bien: tatuaje pensado para cuerpo real, no solo para foto.",
    ],
  },
];

/** Mini helper para sacar el cover de un work */
function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

export default async function AbstractOrganicBlackworkPage() {
  // ✅ Works recientes con tags: organic / abstract / blackwork (y el typo blackworkr por si acaso)
  const latestOrganicWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: {
            OR: [
              { slug: "organic" },
              { slug: "abstract" },
              { slug: "blackwork" },
              { slug: "blackworkr" }, // por si lo has usado alguna vez
              { name: "Organic" },
              { name: "Abstract" },
              { name: "Blackwork" },
              { name: "Blackworkr" },
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
    { href: "#vision", label: "Visión" },
    { href: "#textures", label: "Texturas" },
    { href: "#proceso", label: "Proceso" },
    { href: "#recomendaciones", label: "Recomendaciones" },
    { href: "#cuidados", label: "Curación" },
    { href: "#galeria", label: "Galería" },
    { href: "#booking", label: "Booking" },
  ];

  /**
   * Galería “mosaic” (como blackout).
   * - B/N por defecto
   * - 2 acentos rojos
   * - hover revela color original (lo hace el componente)
   */
  const gallery = [
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535826/IMG_20240423_0003_awrdxw.jpg", alt: "AOB 1" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535787/IMG_2003_tq29yy.jpg", alt: "AOB 2" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535768/D276156E-AEFB-4533-86BA-4771B774BB29_odhxzh.jpg", alt: "AOB 3" }, // no se ve
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535804/IMG_3254_f4wncs.jpg", alt: "AOB 4" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535782/IMG_1165_tmdbyc.jpg", alt: "AOB 5" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535771/DSC05988_jpnfjf.jpg", alt: "AOB 6" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535766/07a18bc7-4d82-4d36-8f58-f2c0da4d1d9b_as4oej.jpg", alt: "AOB 7" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535781/IMG_1006_ly7yam.jpg", alt: "AOB 8" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535792/IMG_2523_gfs6fl.jpg", alt: "AOB 9" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535778/IMG_0394_isaorw.jpg", alt: "AOB 10" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535790/IMG_2137_vozwds.jpg", alt: "AOB 11" },
    { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535768/D276156E-AEFB-4533-86BA-4771B774BB29_odhxzh.jpg", alt: "AOB 12" },
  ];

  // 10 items, con 2 acentos rojos (puedes moverlos donde quieras)
  const mosaicItems: MosaicItem[] = [
    { id: "1", url: gallery[0].url, alt: gallery[0].alt, accent: "red" },
    { id: "2", url: gallery[1].url, alt: gallery[1].alt, accent: "bw" },
    { id: "3", url: gallery[2].url, alt: gallery[2].alt, accent: "red" }, // ROJO
    { id: "4", url: gallery[3].url, alt: gallery[3].alt, accent: "red" },
    { id: "5", url: gallery[4].url, alt: gallery[4].alt, accent: "bw" },
    { id: "6", url: gallery[5].url, alt: gallery[5].alt, accent: "bw" },
    { id: "7", url: gallery[6].url, alt: gallery[6].alt, accent: "bw" },
    { id: "8", url: gallery[7].url, alt: gallery[7].alt, accent: "bw" },
    { id: "9", url: gallery[8].url, alt: gallery[8].alt, accent: "red" }, // ROJO
    { id: "10", url: gallery[9].url, alt: gallery[9].alt, accent: "bw" },
    { id: "11", url: gallery[10].url, alt: gallery[10].alt, accent: "red" }, // ROJO
    { id: "12", url: gallery[11].url, alt: gallery[11].alt, accent: "bw" },
  ];

  /**
   * JSON-LD (IA/SEO friendly)
   * - Service: abstract organic blackwork
   * - BreadcrumbList
   * - FAQPage (basado en tu contenido real de la página)
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
            name: "Abstract Organic Blackwork",
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
        name: "Abstract Organic Blackwork",
        description:
          "Blackwork orgánico y abstracto con diseño sobre piel, texturas vivas y adaptación al cuerpo.",
        provider: { "@id": `${siteUrl}/bio#elvasco` },
        areaServed: { "@type": "City", name: "Madrid" },
        serviceType: ["Tattoo", "Blackwork", "Abstract Blackwork", "Organic Blackwork"],
        availableChannel: [{ "@type": "ServiceChannel", serviceUrl: `${siteUrl}/booking` }],
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${CANONICAL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cómo eliges la textura para mi cuerpo?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Primero leo anatomía y dirección muscular, luego ajusto densidad y respiración para que la textura funcione en postura neutra y en movimiento. Muchas veces el ajuste final ocurre sobre la piel.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto tarda en curar un trabajo grande?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "La curación suele estar en 4–6 semanas. El contraste se estabiliza mejor hacia los 2 meses, y si hace falta reviso para cerrar zonas que hayan quedado más claras.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuándo empiezo a hidratar?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Cuando empiece a pelar, hidrata con tu crema habitual o aceite de coco, con la zona limpia. Poco producto, varias veces si hace falta.",
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
        <Link href="/tattoo" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Tattoo
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Abstract Organic Blackwork</span>

        {/* micro-link útil (sin romper UI) */}
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
            ABSTRACT <span className="text-zinc-500">ORGANIC BLACKW</span>
            <span className="text-red-500">O</span>
            <span className="text-zinc-500">RK</span>
          </>
        }
        subtitle={
          <>
            Texturas orgánicas, flujo natural y{" "}
            <span className="text-zinc-500">adaptación total al cuerpo</span>.
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
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767535775/IMG_0260_khxmaf.jpg",
            alt: "Hero Abstract Organic Blackwork (placeholder)",
          }}
          manifestoTitle="“La naturaleza no dibuja limpio. Dibuja vivo.”"
          manifestoText="Aquí no busco decorar: busco traducir textura real a un cuerpo real. Que se lea de lejos y que tenga piel de cerca."
        />
      </section>

      {/* VISIÓN */}
      <section id="vision" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="vision"
          title="Cómo entiendo el abstract organic blackwork"
          desc="No se trata de rellenar. Se trata de leer."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767537783/copy_of_img_3254_f4wncs_6efeb5.jpg",
            alt: "Textura orgánica (placeholder)",
          }}
        >
          <p>
            El abstract organic nace de observar la naturaleza: cómo se rompe, cómo fluye, cómo se expande.
            Grietas, manchas, filamentos, agua, pigmento en movimiento. Lo importante es que la textura
            tenga intención, no que “quede guapa” en una foto.
          </p>

          <p className="text-zinc-400">
            Trabajo pensando en anatomía y en lectura: dirección muscular, tensiones, curvas, zonas de
            descanso. El cuerpo no es un lienzo plano. Si el tatuaje no acompaña el movimiento, se muere.
          </p>

          <p className="text-zinc-400">
            Muchas veces el diseño final sucede sobre la piel. Ajusto la composición en directo para que el
            conjunto se vea fino en postura neutra y también cuando el cuerpo se contrae, gira o respira.
          </p>
        </EditorialBlock>

        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767539821/copy_of_img_1999_csvvji_ffc05a.jpg",
            alt: "Tattoo orgánico (placeholder)",
          }}
        >
          <p>
            Me interesa el contraste entre control y accidente. Entre negro sólido y textura seca. Entre zonas
            agresivas y zonas de casi-nada. Si todo está a tope, no hay música. Si todo está suave, no hay carácter.
          </p>

          <p className="text-zinc-400">
            Y esto es clave: estos proyectos son carrera de fondo. Prefiero avanzar con ritmo y curación buena a
            “reventar” una sesión por ego. El objetivo es un resultado estable en el tiempo.
          </p>
        </EditorialBlock>

        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
          <div className="text-zinc-200 font-semibold">Principio base</div>
          <p className="mt-2 text-zinc-400 leading-relaxed">
            Una textura orgánica no es un patrón repetido: es un comportamiento. Tiene dirección, densidad, respiración
            y silencio. Si eso está, el tatuaje se siente vivo.
          </p>
        </div>
      </section>

      {/* TEXTURAS (alternando layout izquierda/derecha) */}
      <section id="textures" className="scroll-mt-24 space-y-10">
        <SectionHeading
          id="texturas"
          title="Texturas"
          desc="Arriba textura, abajo traducción a piel. Alternamos izquierda/derecha para que la página tenga ritmo."
        />

        <div className="space-y-12">
          {TEXTURES.map((t, idx) => {
            const flip = idx % 2 === 1; // 0 izq->dcha, 1 dcha->izq, etc.

            return (
              <section key={t.key} id={t.key} className="scroll-mt-24 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Textura</div>
                  <h3 className="text-2xl font-semibold">{t.title}</h3>
                  <p className="text-sm text-zinc-400">{t.subtitle}</p>
                </div>

                {/* Grid alterno:
                    - En desktop (lg), cambiamos el orden con order utilities
                    - En móvil, siempre apilado (slider arriba, texto abajo) */}
                <div className="grid gap-6 lg:grid-cols-2 items-start">
                  {/* Slider */}
                  <div className={flip ? "lg:order-2" : "lg:order-1"}>
                    <TattooRevealSlider
                      topImage={t.topImage}
                      bottomImage={t.bottomImage}
                      altTop={`${t.title} texture`}
                      altBottom={`${t.title} tattoo`}
                    />
                  </div>

                  {/* Texto */}
                  <div className={flip ? "lg:order-1" : "lg:order-2"}>
                    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
                      <p className="text-zinc-200">{t.intro}</p>

                      <ul className="space-y-2 text-zinc-400">
                        {t.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex gap-2">
                            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 text-xs text-zinc-500">
                        Tip: cuando metas tus fotos reales, intenta que la foto de textura y la del tattoo tengan “gesto”
                        parecido. El reveal se vuelve hipnótico.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-900/80" />
              </section>
            );
          })}
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso" className="scroll-mt-24 space-y-6">
        <SectionHeading id="proceso" title="Proceso" desc="Tres pasos, claros. Sin humo." />

        <ProcessGrid
          steps={[
            {
              title: "Diseño",
              desc:
                "Referencias + lectura del cuerpo. Ajusto dirección y densidad para que la textura funcione con tu anatomía, no contra ella.",
            },
            {
              title: "Sesión",
              desc:
                "Trabajo intenso pero con cabeza: pausas, comunicación y ritmo. Si hay que parar, se para. Buscamos negro sólido y textura limpia.",
            },
            {
              title: "Curación",
              desc:
                "Aquí se decide el acabado. Te doy instrucciones claras y seguimiento. Prefiero que preguntes a que improvises.",
            },
          ]}
        />
      </section>

      {/* RECOMENDACIONES */}
      <section id="recomendaciones" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="recomendaciones"
          title="Recomendaciones"
          desc="Trabajo grande = cuerpo trabajando. Esto te ayuda a llegar fino a la sesión y curar mejor."
        />

        <ChecklistColumns
          intro="Dos listas rápidas. Lo justo y necesario."
          cols={[
            {
              title: "Preparación previa",
              items: [
                "Dormir bien la noche anterior",
                "Comer una comida completa antes de venir",
                "Hidratar la piel los días previos",
                "Evitar alcohol y drogas 24h antes",
                "Ropa cómoda y adecuada para la zona",
              ],
            },
            {
              title: "Durante la sesión",
              items: [
                "Comunicación constante (si algo no va bien, se dice)",
                "Pausas cuando lo necesites (esto no es una prueba de ego)",
                "Mantener azúcar estable (trae algo si eres de bajones)",
                "Respirar y relajar hombros/mandíbula",
                "Confiar en el proceso artístico",
              ],
            },
          ]}
        />
      </section>

      {/* CURACIÓN */}
      <section id="cuidados" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="cuidados"
          title="Curación y cuidados"
          desc="Práctico, claro y directo. Vuelves aquí después del tattoo."
        />

        <CareSteps
          steps={[
            {
              n: "01",
              title: "Primeras 48h",
              text:
                "Curación en seco. Empapador + cambios cada 12h. Limpieza cuidadosa para que lo que expulse (tinta/plasma) no se quede pegado.",
            },
            {
              n: "02",
              title: "Dejar respirar",
              text:
                "Cuando esté limpio y seco, al aire. Evita cremas/aceites al principio salvo indicación.",
            },
            {
              n: "03",
              title: "Hidratación",
              text:
                "Cuando empiece a pelar, hidrata con tu crema habitual o aceite de coco. Poco producto, varias veces si hace falta.",
            },
            {
              n: "04",
              title: "Evita castigar la zona",
              text:
                "Nada de sol directo. Nada de piscina/mar 2 semanas. Ropa suelta que no roce. Las primeras 48h suele haber inflamación y menos movilidad.",
            },
            {
              n: "05",
              title: "Timeline",
              text:
                "Curación 4–6 semanas. El contraste se estabiliza mejor hacia 2 meses. Si hace falta, reviso y cierro zonas.",
            },
          ]}
          noteTitle="Si algo te preocupa"
          noteText="Dolor excesivo, calor raro, pus, mal olor, fiebre que no baja o enrojecimiento que se expande: me escribes. Prefiero que me des la turra a que te hagas el héroe."
        />
      </section>

      {/* GALERÍA (MosaicGallery) */}
      <section id="galeria" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="galeria"
          title="Galería"
          desc="Mosaic elegante: B/N por defecto, dos acentos en rojo. Hover revela el color original. Click abre visor."
        />

        <MosaicGallery items={mosaicItems} title="Abstract Organic Blackwork" />
      </section>

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Booking"
          desc="Si quieres abstract organic blackwork, ven con intención y con tiempo. Lo demás lo afinamos juntos."
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

      {/* Últimos works con tag organic/abstract/blackwork */}
      {latestOrganicWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">
                Últimos works: <span className="text-red-500">organic · abstract · blackwork</span>
              </div>
            </div>

            <Link
              href="/work?tag=blackwork"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestOrganicWorks.map((w) => {
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
