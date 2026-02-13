// src/app/tattoo/science/page.tsx
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
import SectionTitle from "@/components/evergreen/SectionTitle";

import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

/**
 * SEO: metadata + canonical + OG/Twitter
 * (simple, consistente, y “IA friendly”)
 */
const PAGE_TITLE = "Tattoo Science & History · oficio, tradición y método · elvasco.x";
const PAGE_DESC =
  "Tattoo Science & History: historia del tatuaje, coil machines, needle soldering y experimentos de taller. Método, herramientas y curación explicados sin humo.";
const CANONICAL = "/tattoo/science";

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
 * Placeholders rápidos para maquetación:
 * - Luego los sustituyes por tus fotos reales (Cloudinary, etc).
 * - Picsum: consistente, ligero, sirve para layout.
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

export default async function TattooSciencePage() {
  /**
   * Works relacionados:
   * - Ajusta slugs/nombres cuando decidas tu taxonomía real.
   * - Lo dejo “a prueba de guerra”.
   */
  const latestScienceWorks = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: tagOr([
            "science",
            "history",
            "tattoo-science",
            "tattoo-history",
            "coil",
            "coil-machines",
            "machine",
            "machines",
            "needle",
            "needles",
            "soldering",
            "tradition",
            "tradicional",
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

  /**
   * Anchor nav (académico, pero sin pasarnos)
   * - Si quieres más “ensayo” y menos “landing”, lo quitamos.
   */
  const navItems = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#history", label: "History" },
    { href: "#coil", label: "Coil machines" },
    { href: "#needles", label: "Needle soldering" },
    { href: "#experiments", label: "Experiments" },
    { href: "#booking", label: "Booking" },
  ];

  /**
   * Experiments (demo):
   * - Cada experimento tiene un mini mosaic distinto para que se vea “editorial”.
   */
  const experiments = [
    {
      id: "exp-1",
      title: "Custom BLACK-OUT coil machine",
      subtitle: "Adaptación de maquina para trabajar a altas frecuencia",
      hero: { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_9723_teeer0.jpg", alt: "Experiment 01 (placeholder)" },
      text: [
        "Objetivo:Objetivo: conseguir una maquina que trabaje a alta velocidad, sin necesidad de subir en exceso el voltaje para evitar hacer daño en la piel y sobrecalentamiento en la misma maquina.",
        "el truco esta en conseguir el equilibrio entre un rango de movimiento corto y no perder fuerza de pegada",
        "Si reducimos la elasticidad del fleje delantero añadiendo un segundo fleje, reducimos su rango de movimiento y consiguiendo un equilibrio entre condensador y tensión del fleje trasero, conseguimos velocidades entorno a los 200Hz con no mas de 12v",
      ],
      mosaic: [
        { id: "1", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_4969_n2wyoz.jpg", alt: "Exp1 1", accent: "bw" },
        { id: "2", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_20231122_0001_imcozx.jpg", alt: "Exp1 2", accent: "red" },
        { id: "3", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_8960_f2gmri.jpg", alt: "Exp1 3", accent: "bw" },
        { id: "4", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_8960_f2gmri.jpg", alt: "Exp1 4", accent: "bw" },
        { id: "5", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_20231119_0006_q6xudl.jpg", alt: "Exp1 5", accent: "bw" },
        { id: "6", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_8960_f2gmri.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "7", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_8478_fnup5a.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "8", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/DA9A3EFC-6989-4198-8F50-1A52D127101B_rm0hcp.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "9", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_9722_k8rwbj.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "10", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_20230925_0001_vndzu7.jpg", alt: "Exp1 6", accent: "red" },
        { id: "11", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601188/IMG_20231122_0001_imcozx.jpg" , alt: "Exp1 6", accent: "bw" },
        { id: "12", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767601187/29BC466C-8EB2-48B1-9475-B03B50C0C22D_kqh0kg.jpg", alt: "Exp1 6", accent: "bw" },
      ] satisfies MosaicItem[],
    },
    {
      id: "exp-2",
      title: "Full BLACK coil machine",
      subtitle: "Si puede ser negro, hagamoslo negro",
      hero: { url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602203/IMG_9726_ni3w3n.jpg", alt: "Experiment 02 (placeholder)" },
      text: [
        "Después de un tiempo haciendo la piel de nuestros clientes Full Black, nos preguntamos... ¿y si podemos hacer nuestras maquinas full black?.",
        "Tras una pequeña investigación, descubrimos que el metal lo podíamos `Pavonar´ de negro mediante un proceso químico, con Sosa caustica y un nitrato así que nos pusimos manos a la obra",
        "Un lijado a las piezas para eliminar cualquier impureza y abrir bien los poros al metal, un cocinado al punto en químicos... y ya tenemos las piezas full black que tanto buscábamos, Próximo paso: Pintarlas con el negro mas negro del mercado el `Vanta Black´",
      ],
      mosaic: [
        { id: "1", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602204/IMG_9728_fpfwos.jpg", alt: "Exp2 1", accent: "bw" },
        { id: "2", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602199/IMG_8825_o7gq67.jpg", alt: "Exp2 2", accent: "red" },
        { id: "3", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602199/IMG_8825_o7gq67.jpg", alt: "Exp2 3", accent: "bw" },
        { id: "4", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602199/IMG_8630_tf9xkz.jpg", alt: "Exp2 4", accent: "red" },
        { id: "5", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602200/IMG_8915_uch5yx.jpg", alt: "Exp2 5", accent: "bw" },
        { id: "6", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602198/IMG_8627_bjbqms.jpg", alt: "Exp2 6", accent: "bw" },
        { id: "7", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602204/IMG_9727_swjbmj.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "8", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602199/IMG_8943_r18jrr.jpg", alt: "Exp1 6", accent: "red" },
        { id: "9", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602199/IMG_8980_arcv8a.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "10", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602201/IMG_9273_z6gnpz.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "11", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602200/IMG_9268_vcl09v.jpg", alt: "Exp1 6", accent: "bw" },
        { id: "12", url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767602202/IMG_9724_cchk3c.jpg", alt: "Exp1 6", accent: "red" },
      ] satisfies MosaicItem[],
    },
  ];

  /**
   * JSON-LD (IA/SEO friendly)
   * - BreadcrumbList
   * - WebPage
   * - Person (brand)
   * - Collection/Blog-like section + FAQPage mínima (sin inventar demasiado)
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Tattoo", item: `${siteUrl}/tattoo` },
          { "@type": "ListItem", position: 3, name: "Science & History", item: `${siteUrl}${CANONICAL}` },
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
        "@type": "CollectionPage",
        "@id": `${siteUrl}${CANONICAL}#collection`,
        name: "Tattoo Science & History",
        description:
          "Notas de taller sobre historia del tatuaje, máquinas de bobina, soldado de agujas y experimentos prácticos.",
        mainEntity: {
          "@type": "CreativeWorkSeries",
          name: "Tattoo Science & History",
          creator: { "@id": `${siteUrl}/bio#elvasco` },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}${CANONICAL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿De qué va Tattoo Science & History?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "De oficio y método: historia del tatuaje, herramientas (coil machines), soldado de agujas y experimentos documentados para entender por qué funciona lo que funciona.",
            },
          },
          {
            "@type": "Question",
            name: "¿Publicas experimentos reales o teoría?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Ambas: teoría aplicada y notas de taller. Lo importante es documentar proceso, decisiones y resultados para mejorar consistencia y curación.",
            },
          },
          {
            "@type": "Question",
            name: "¿Puedo reservar tatuaje desde esta página?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Sí: el booking va por la plantilla de contacto. Si tu proyecto encaja, se concreta por fechas, presupuesto y dirección artística.",
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
        <span className="text-zinc-300">Science & History</span>

        {/* micro-link útil (sin romper UI) */}
        <span className="text-zinc-700">·</span>
        <Link href="/booking" className="text-zinc-500 hover:text-zinc-200 transition">
          Booking →
        </Link>
      </div>


      <SectionTitle
        title={
          <>
            TATTOO <span className="text-zinc-500">SCIENCE &amp; HISTO</span>
            <span className="text-red-500">R</span>
            <span className="text-zinc-500">Y</span>
          </>
        }
        subtitle={
          <>
            Oficio, tradición y{" "}
            <span className="text-zinc-500">obsesión por entender</span> por qué funciona lo que funciona.
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
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767598266/IMG_9713_ntdixg.jpg",
            alt: "Tattoo science hero (placeholder)",
          }}
          manifestoTitle="“El oficio no es estética. Es método.”"
          manifestoText="Lo visual importa, claro. Pero si no entiendes herramienta, piel, ritmo y curación, lo visual es humo. Aquí escribo para aprender, ordenar y compartir."
        />
      </section>

      {/* HISTORY */}
      <section id="history" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="history"
          title="History"
          desc="Un recorrido largo: el tatuaje como marca cultural, tecnología y lenguaje del cuerpo."
        />

        {/* Editorial 1 (texto largo + imagen) */}
        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767598812/IMG_9717_klysd6.jpg",
            alt: "History image 1 (placeholder)",
          }}
        >
          <p>
            El tatuaje no nace como adorno. Nace como señal: pertenencia, rito,
            estatus, protección, duelo, memoria. Cambian los símbolos, cambia la
            moral de la época, pero el gesto se mantiene: marcar la piel para
            decir algo que no cabe en palabras.
          </p>
          <p className="text-zinc-400">
            Lo interesante es que el tatuaje siempre ha sido también tecnología.
            Herramientas, pigmentos, higiene, transmisión de conocimiento. El
            oficio se ha construido entre tradición y adaptación: cada generación
            hereda una técnica y la empuja un poco más.
          </p>
          <p className="text-zinc-400">
            Si lo miras con calma, hay un patrón: cuando el tatuaje se vuelve
            “moda”, el oficio se protege volviendo a lo esencial. Menos prisa.
            Más método. Más respeto por la piel como órgano vivo.
          </p>
        </EditorialBlock>

        {/* Bloque libre (no rejilla) */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Nota de taller</div>
          <p className="text-zinc-200 font-semibold">
            La historia del tatuaje también es la historia de sus límites.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Lo que hoy llamamos “estilo” muchas veces nació de limitaciones reales:
            agujas, potencia, tiempo, cicatrización, pigmento, tipo de piel, clima,
            higiene. Y aun así: la gente hacía arte. Ese es el punto.
          </p>
        </div>

        {/* Editorial 2 (reverse) */}
        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767598502/IMG_6174_whjmqn.jpg",
            alt: "History image 2 (placeholder)",
          }}
        >
          <p>
            Me interesa la figura del tatuador como artesano: alguien que no solo
            “dibuja”, sino que resuelve. Que entiende desgaste de máquina, aguja,
            piel, tensiones, curación. Y que hace de todo eso un lenguaje visual.
          </p>
          <p className="text-zinc-400">
            Esta sección no va de enciclopedia. Va de oficio. De cómo se aprende:
            mirando, probando, fallando, repitiendo. Y de cómo se sostiene una
            ética de trabajo cuando todo alrededor te empuja a la velocidad.
          </p>
        </EditorialBlock>
      </section>

      {/* COIL MACHINES */}
      <section id="coil" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="coil"
          title="Coil machines"
          desc="Por qué me gusta la tradición: bobinas, golpe, sonido y control."
        />

        {/* Bloque “flow libre”: imagen grande + texto a un lado */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">
              {/* Imagen placeholder */}
              <img
                src= "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767598990/IMG_4400-2_kskbh9.jpg"
                alt="Coil machines hero (placeholder)"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <p className="text-zinc-200">
              Las bobinas no son nostalgia: son carácter. Un tipo de golpe y un
              tipo de respuesta. No es “mejor o peor” que rotativa: es distinto.
              Y yo disfruto esa relación directa con el peso del golpe.
            </p>
            <p className="text-zinc-400">
              Una coil bien montada te obliga a escuchar. Literalmente. Suena,
              vibra, te habla. Y ese feedback cambia cómo trabajas: velocidad,
              profundidad, tensión de piel, timing. Para mí eso es oficio.
            </p>
            <p className="text-zinc-400">
              La rotativa moderna es cómoda y limpia, sí. Pero a veces esa
              comodidad te desconecta del proceso. Con coil siento que “estoy
              tatuando”, no “operando una herramienta”. Y en proyectos grandes
              eso importa.
            </p>
          </div>
        </div>

        {/* Editorial reverse (texto largo + imagen) */}
        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767599160/IMG_9718_whnqhb.jpg",
            alt: "Coil machine detail (placeholder)",
          }}
        >
          <p>
            Hay una diferencia que casi nadie cuenta: la coil te enseña disciplina
            de mano. Si te pasas, lo notas. Si te quedas corto, también. Es menos
            indulgente. Y por eso te hace mejor.
          </p>
          <p className="text-zinc-400">
            Cuando me preguntan “¿por qué no usas siempre rotativa?”, la respuesta
            es simple: porque yo elijo herramientas por resultado y por sensación
            de trabajo. En blackwork, en líneas, en ciertas texturas, hay golpes
            que me interesa cómo los da una coil.
          </p>
          <p className="text-zinc-400">
            También es tradición. No la tradición como postureo, sino como
            continuidad: saber de dónde viene el oficio y respetar el método que
            lo construyó.
          </p>
        </EditorialBlock>
      </section>

      {/* NEEDLE SOLDERING */}
      <section id="needles" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="needles"
          title="Needle soldering"
          desc="Soldar agujas: libertad creativa, precisión y respeto por el oficio."
        />

        <EditorialBlock
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767599478/IMG_20230725_0001_drit3r.jpg",
            alt: "Needle soldering (placeholder)",
          }}
        >
          <p>
            Soldar agujas es volver a lo esencial: entender la herramienta desde
            dentro. No es solo “hacerte tus agujas”. Es controlar agrupación,
            rigidez, apertura, comportamiento en piel. Cambia cómo líneas y
            texturas se depositan y cómo curan.
          </p>
          <p className="text-zinc-400">
            La libertad creativa real empieza cuando puedes fabricar tu propio
            medio. Si quiero una textura concreta, una respuesta concreta, puedo
            diseñarla. Eso para mí es arte aplicado al oficio.
          </p>
          <p className="text-zinc-400">
            Y sí: también es tradición. En un mundo donde todo viene empaquetado,
            soldar agujas es una forma de respeto. Un “sé lo que estoy haciendo”
            y no solo “sé comprarlo”.
          </p>
        </EditorialBlock>

        {/* Bloque “break” con otra composición (sin rejilla rígida) */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Por qué lo hago</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">en 3 puntos</span>
          </div>

          <ul className="space-y-2 text-zinc-400">
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>Control: agrupación y respuesta en piel.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>Libertad: herramientas al servicio de una estética.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>Tradición: continuidad del oficio sin romanticismo barato.</span>
            </li>
          </ul>
        </div>

        <EditorialBlock
          reverse
          media={{
            kind: "image",
            url: "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767599756/IMG_9721_z8xfym.jpg",
            alt: "Needle details (placeholder)",
          }}
        >
          <p>
            Cuando haces trabajos grandes, la aguja importa más de lo que parece.
            No por “técnica”, sino por consistencia: cómo descansa la piel, cómo
            se deposita el pigmento, cuánto castigas, y cómo queda el acabado
            después de 4–6 semanas.
          </p>
          <p className="text-zinc-400">
            La idea es simple: menos misterio, más método. Si algo no funciona,
            lo ajusto. Si funciona, lo documento. Y si puedo compartirlo, lo
            comparto.
          </p>
        </EditorialBlock>
      </section>

      {/* EXPERIMENTS */}
      <section id="experiments" className="scroll-mt-24 space-y-6">
        <SectionHeading
          id="experiments"
          title="Tattoo experiments"
          desc="Una sección viva. Aquí voy subiendo pruebas, notas y resultados con el tiempo."
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

                {/* Layout libre: alternamos imagen y texto */}
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

      {/* BOOKING */}
      <section id="booking" className="scroll-mt-24 space-y-6">
        <CTABox
          title="Booking"
          desc="Si te mola esta parte del oficio (y no solo el resultado en foto), hablamos. Proyectos grandes = tiempo, cabeza y compromiso."
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

      {/* Últimos works relacionados */}
      {latestScienceWorks.length ? (
        <section className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">actualidad</div>
              <div className="text-2xl font-semibold">
                Últimos works relacionados
              </div>
            </div>

            <Link href="/work?tag=science" className="text-sm text-zinc-400 hover:text-zinc-200 transition">
              Ver archivo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestScienceWorks.map((w) => {
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
