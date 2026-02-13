// src/app/bio/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

import {
  CTA,
  Divider,
  H2,
  Kicker,
  Lead,
  P,
  Pills,
  Quote,
  Toc,
} from "@/components/BioBlocks";
import MediaRenderer from "@/components/MediaRenderer";

export const dynamic = "force-dynamic";

function formatDate(d?: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("es-ES");
  } catch {
    return null;
  }
}

function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/bio");

  return {
    title: "Bio · elvasco.x",
    description:
      "Bio / manifiesto de El Vasco: tattoo, música, film y creative dev. Un archivo vivo: proceso, cicatrices y obra real.",
    alternates: { canonical },
    openGraph: {
      title: "Bio · elvasco.x",
      description:
        "Bio / manifiesto de El Vasco: tattoo, música, film y creative dev. Un archivo vivo: proceso, cicatrices y obra real.",
      url: canonical,
      type: "profile",
    },
  };
}

export default async function BioPage() {
  const canonical = siteUrl("/bio");

  // ✅ Bio Featured (curado por tag)
  // Nota: si aún no existe el tag, no rompe: simplemente no mostrará cards.
  const bioFeatured = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tag: { slug: "bio-featured" } } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6,
    select: {
      id: true,
      type: true,
      slug: true,
      title: true,
      excerpt: true,
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

  const toc = [
    { href: "#manifiesto", label: "Manifiesto" },
    { href: "#prueba", label: "Prueba / evidencia" },
    { href: "#musica", label: "Música" },
    { href: "#film", label: "Film" },
    { href: "#tattoo", label: "Tattoo" },
    { href: "#dev", label: "Creative Dev / IA" },
    { href: "#cierre", label: "Cierre" },
  ];

  // ✅ Fotos stock (placeholder). Cambias luego por tus URLs reales.
  // Consejo: retrato B/N coherente, grano, contraste y negativo.
  const PHOTOS = {
    portrait:
      "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767371581/IMG_9598_m7lqoo.jpg",
    tattooHands:
      "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767372412/IMG_9613_vbcidz.jpg",
    musicGear:
      "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767372412/IMG_7243_vxjv78.jpg",
    editSuite:
      "https://res.cloudinary.com/dc5i5qzqo/image/upload/v1767372412/IMG_9623_jzkfyc.jpg",
  };

  // JSON-LD (AboutPage + Person)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Bio · elvasco.x",
    url: canonical,
    description:
      "Bio / manifiesto de El Vasco: tattoo, música, film y creative dev. Un archivo vivo: proceso, cicatrices y obra real.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Person",
      name: "El Vasco",
      alternateName: ["elvasco.x", "Elvasco"],
      url: siteUrl("/"),
      image: PHOTOS.portrait, // placeholder; reemplazar por tu retrato real cuando toque
      description:
        "Tatuador, músico, filmmaker y creative dev. Artista autodidacta y multidisciplinar.",
      sameAs: [
        "https://www.instagram.com/elvasco.x",
        "https://youtube.com/@elvasco.x",
      ],
      knowsAbout: [
        "Blackwork",
        "Blackout",
        "Tattoo",
        "Techno",
        "Acid Techno",
        "Metal",
        "Filmmaking",
        "Video editing",
        "Full Stack Development",
        "Automation",
        "Artificial Intelligence",
      ],
    },
  };

  // 70/30: “mito + criterio” con CTAs claros pero sin postureo
  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-10">
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
        <span className="text-zinc-300">Bio</span>
      </div>

      <section className="space-y-10">
        {/* HERO (brutalista + retrato) */}
        <header className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="space-y-4">
              <Kicker>Bio / Manifiesto</Kicker>

              {/* Título brutalista */}
              <div className="space-y-3 pb-3">
                <h1 className="leading-[0.85]">
                  <span className="block text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tight">
                    ELVASCO
                    <span className="text-red-500">.</span>
                    <span className="bio-glitch-x" data-text="X">
                      X
                    </span>
                  </span>
                </h1>

                <div className="text-sm text-zinc-400">
                  CREATIVE SYSTEMS · Underground by choice{" "}
                  <span className="text-red-500">✖</span>
                </div>
              </div>

              <Lead>
                Tatuador, músico, filmmaker y creative dev. Artista autodidacta y
                multidisciplinar. Esto es una bitácora, un camino en proceso y obra real.
              </Lead>

              <div className="pt-1">
                <Pills
                  items={[
                    "Underground by choice",
                    "Blackwork / Blackout",
                    "Techno/Acid + Metal",
                    "Film noir / glitch",
                    "Full Stack + IA",
                  ]}
                />
              </div>

              {/* CTAs (30%) */}
              <div className="flex flex-wrap gap-3 pt-2">
                <CTA href="/booking" label="Contacto / Booking" variant="solid" />
                <CTA href="/work" label="Abrir archivo" />
                <CTA href="/tattoo" label="Tattoo" />
                <CTA href="/musica" label="Música" />
                <CTA href="/film" label="Film" />
                <CTA href="/arte" label="Arte" />
                <CTA href="/dev" label="Creative Dev" />
              </div>

              <div className="text-xs text-zinc-500 pt-2">
                Nota: Este es mi camino, aqui te cuento por donde empece y hacia donde voy
              </div>
            </div>

            {/* Retrato */}
            <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
              <div className="relative aspect-[4/5] bg-zinc-950">
                <img
                  src={PHOTOS.portrait}
                  alt="Retrato en blanco y negro"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="p-4 text-xs text-zinc-500 flex items-center justify-between">
                <span>Aitor Susperregui - Tsuspe @elvasco.x</span>
                <span className="text-red-500">✖</span>
              </div>
            </div>
          </div>
        </header>

        <Divider />

        {/* LAYOUT: contenido + índice */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <main className="space-y-10">
            {/* MANIFIESTO */}
            <section id="manifiesto" className="space-y-4 scroll-mt-24">
              <H2 id="manifiesto">Manifiesto</H2>


              <Quote>El arte no fue una elección. Fue una necesidad.</Quote>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 space-y-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Principios
                </div>
                <ul className="space-y-2 text-zinc-300">
                  {[
                    "Negro como lenguaje.",
                    "Proceso antes que espectáculo.",
                    "Lo orgánico no se diseña: se encuentra.",
                    "Cine, ruido y tinta: misma sangre.",
                    "Menos ruido, más obra.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-red-500/80">✖</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <P>
                Desde niño sentí ese impulso irrefrenable por crear. Robaba la
                Handycam de mi padre para grabar historias con mis muñecos y
                pedía “castigo” en mi cuarto solo para dibujar en paz. (Texto
                placeholder: luego lo ajustas tú fino).
              </P>

              <P>
                En cada trazo, cada frame y cada beat, intento entender quién
                soy y hacia dónde voy. El camino sigue: menos humo, más obra.
              </P>
            </section>

            <Divider />

            {/* PRUEBA / EVIDENCIA (conecta Bio al sistema nuevo) */}
            <section id="prueba" className="space-y-4 scroll-mt-24">
              <H2 id="prueba">Prueba / evidencia</H2>

              <Quote>Lo que digo aquí se ve en el archivo. Sin excusas.</Quote>

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: "Ahora mismo",
                    desc: "En qué estoy metido hoy (sin postureo).",
                    items: [
                      "Blackout / patrones orgánicos (flujo y respiración).",
                      "Acid / live jams (303 con mala leche).",
                      "Dev / automatizaciones (Next.js + Prisma + n8n).",
                    ],
                  },
                  {
                    title: "Dónde verlo",
                    desc: "Rutas rápidas para entrar sin perderte.",
                    items: [
                      "Archivo transversal (/work).",
                      "Últimos drops (home).",
                      "Música / Tattoo / Film / Arte / Dev.",
                    ],
                  },
                  {
                    title: "Si quieres trabajar conmigo",
                    desc: "Lo fácil: agenda o escríbeme. Lo difícil: hacerlo bien.",
                    items: [
                      "Booking (/booking).",
                      "Contacto (/contacto).",
                      "Instagram (elvasco.x).",
                    ],
                  },
                ].map((b) => (
                  <div
                    key={b.title}
                    className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
                  >
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {b.title}
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">{b.desc}</div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      {b.items.map((it) => (
                        <li key={it} className="flex gap-2">
                          <span className="text-red-500/80">✖</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>

                    {b.title === "Ahora mismo" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CTA href="/tattoo" label="Tattoo →" />
                        <CTA href="/musica" label="Música →" />
                        <CTA href="/dev" label="Dev →" />
                      </div>
                    ) : null}

                    {b.title === "Dónde verlo" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CTA href="/work" label="Abrir archivo →" />
                        <CTA href="/" label="Home →" />
                      </div>
                    ) : null}

                    {b.title === "Si quieres trabajar conmigo" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <CTA href="/booking" label="Booking →" variant="solid" />
                        <CTA href="/contacto" label="Contacto →" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {/* BIO FEATURED (curado por tag) */}
            {bioFeatured.length ? (
              <>
                <Divider />
                <section className="space-y-4 scroll-mt-24">
                  <H2 id="Bio">Bio · Featured</H2>
                  <P>
                    Selección curada que define el universo. Control total: si
                    está aquí, es porque tú lo has marcado.
                  </P>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bioFeatured.slice(0, 6).map((w) => {
                      const cover = pickCover(w.media as any[]);
                      const tagNames = (w.tags ?? [])
                        .slice(0, 3)
                        .map((t) => t.tag.name);

                      return (
                        <Link
                          key={w.id}
                          href={`/work/${w.slug}`}
                          className="group rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden hover:border-zinc-600 transition"
                        >
                          <div className="relative aspect-[16/10] bg-zinc-950">
                            {cover ? (
                              <>
                                <MediaRenderer
                                  media={cover as any}
                                  className="h-full w-full"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-black" />
                            )}
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="text-xs uppercase tracking-wide text-zinc-500">
                              {w.type}
                              {w.publishedAt ? (
                                <span className="text-zinc-600">
                                  {" "}
                                  · {formatDate(w.publishedAt)}
                                </span>
                              ) : null}
                            </div>

                            <div className="text-lg font-semibold text-zinc-100 leading-tight">
                              {w.title}
                            </div>

                            {w.excerpt ? (
                              <p className="text-sm text-zinc-400 line-clamp-2">
                                {w.excerpt}
                              </p>
                            ) : null}

                            <div className="pt-2 flex flex-wrap gap-2">
                              {tagNames.map((t) => (
                                <span
                                  key={t}
                                  className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                                >
                                  {t}
                                </span>
                              ))}
                              <span className="text-xs rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-zinc-100">
                                bio-featured
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <CTA href="/work" label="Ver todo el archivo →" />
                  </div>
                </section>
              </>
            ) : null}

            <Divider />

            {/* MÚSICA */}
            <section id="musica" className="space-y-4 scroll-mt-24">
              <H2 id="musica">Música</H2>
              <Quote>Mi primer ampli fue una cinta de casete.</Quote>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
                <div className="space-y-3">
                  <P>
                    Verano del 93/94. Un casete (“Kañera de la hostia, Vol. II”)
                    y de pronto Pantera: “Fucking Hostile”. (Placeholder) Ahí
                    entendí que la agresión podía ser estética y disciplina.
                  </P>
                  <P>
                    Aprendí a oído, rebobinando casetes. Después vinieron
                    bandas, grabaciones, directo, giras y el hambre de controlar
                    el sonido por dentro.
                  </P>

                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Enfoque
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Techno/acid: groove, tensión, jam y textura.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Metal: riff, dinámica y verdad (cero maquillaje).</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Hardware-first cuando tiene sentido.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <CTA href="/musica" label="Ir a Música →" />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
                  <div className="relative aspect-[4/5] bg-zinc-950">
                    <img
                      src={PHOTOS.musicGear}
                      alt="Setup música (placeholder)"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                  <div className="p-4 text-xs text-zinc-500">
                    Malleficarum - 2010
                  </div>
                </div>
              </div>
            </section>

            <Divider />

            {/* FILM */}
            <section id="film" className="space-y-4 scroll-mt-24">
              <H2 id="film">Film</H2>
              <Quote>Cada frame es una búsqueda: luz, textura y silencio.</Quote>

              <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
                <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
                  <div className="relative aspect-[4/5] bg-zinc-950">
                    <img
                      src={PHOTOS.editSuite}
                      alt="Edición / post (placeholder)"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                  <div className="p-4 text-xs text-zinc-500">
                    Recording Live Techno sesions
                  </div>
                </div>

                <div className="space-y-3">
                  <P>
                    El sonido me llevó a la imagen. (Placeholder) Trabajé en
                    estudio y directo, y eso me abrió el hambre de controlar
                    narrativa: cámara, edición, VFX y color.
                  </P>
                  <P>
                    Me interesa lo sucio bien hecho: grano, contraste, sombras
                    duras. Film noir, glitch con criterio, y narrativa sin
                    florituras.
                  </P>

                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Toolkit
                    </div>
                    <div className="mt-3 text-sm text-zinc-300">
                      Edición, color, VFX (placeholder). Lo importante: intención
                      + ritmo + textura.
                    </div>
                  </div>

                  <div className="pt-2">
                    <CTA href="/film" label="Ir a Film →" />
                  </div>
                </div>
              </div>
            </section>

            <Divider />

            {/* TATTOO */}
            <section id="tattoo" className="space-y-4 scroll-mt-24">
              <H2 id="tattoo">Tattoo</H2>
              <Quote>Del metal al blackwork: misma pulsión, distinta piel.</Quote>

              <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
                <div className="space-y-3">
                  <P>
                    El tatuaje entró en mi vida antes del nacimiento de mi hija.
                    Arreglé una máquina rota, investigué como un enfermo y
                    empecé a tatuar. (Placeholder)
                  </P>
                  <P>
                    Me obsesionan el flujo, la composición y el negro con
                    respiración. Blackout cuando hay que cortar el ruido.
                    Blackwork orgánico cuando el cuerpo pide tensión.
                  </P>

                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-5">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Cómo trabajo
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Diseño para el cuerpo (no para la foto).</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Negro sólido + respiración.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-red-500/80">✖</span>
                        <span>Proceso y curación: se hace bien o no se hace.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <CTA href="/tattoo" label="Ir a Tattoo →" />
                    <CTA href="/tattoo/science" label="Tattoo Science →" />
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
                  <div className="relative aspect-[4/5] bg-zinc-950">
                    <img
                      src={PHOTOS.tattooHands}
                      alt="Manos tatuando (placeholder)"
                      className="h-full w-full object-cover opacity-90"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                  <div className="p-4 text-xs text-zinc-500">
                    Tattoo / proceso for @danteripper_
                  </div>
                </div>
              </div>
            </section>

            <Divider />

            {/* DEV */}
            <section id="dev" className="space-y-4 scroll-mt-24">
              <H2 id="dev">Creative Dev / IA</H2>
              <Quote>La tecnología no es un atajo. Es un amplificador del criterio.</Quote>

              <P>
                En los últimos años el código se convirtió en otra herramienta
                creativa. No me interesa “programar por programar”: me interesa
                detectar problemas, diseñar sistemas y crear herramientas que
                funcionan. (Placeholder)
              </P>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 space-y-3">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Ahora
                </div>
                <div className="text-sm text-zinc-300">
                  Next.js + Prisma + automatizaciones (n8n). IA aplicada donde
                  suma: edición, contenido, workflows y producto.
                </div>
              </div>

              <div className="pt-2">
                <CTA href="/dev" label="Ir a Creative Dev →" />
              </div>
            </section>

            <Divider />

            {/* CIERRE */}
            <section id="cierre" className="space-y-4 scroll-mt-24">
              <H2 id="cierre">Cierre</H2>
              <Quote>Soy “El Vasco”. Esto es mi archivo. Y esto va en serio.</Quote>

              <P>
                Este sitio es un archivo vivo de aprendizaje, experimentación y
                búsqueda de sentido. Si llegas por una faceta, ojalá descubras
                las demás. (Placeholder)
              </P>

              <P>Underground by choice.</P>

              <div className="pt-2 flex flex-wrap gap-3">
                <CTA href="/journal" label="Ir al Journal →" />
                <CTA href="/booking" label="Contactar / Booking →" variant="solid" />
                <CTA href="/work" label="Abrir archivo →" />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/30 p-5 text-sm text-zinc-400">
                Si quieres algo crudo y bien hecho: hablamos. Si quieres humo,
                hay otros.
              </div>
            </section>
          </main>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <Toc items={toc} />
            <div className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400 bg-black/20">
              Tip: este índice ayuda a SEO y a navegación. Y a que la peña no se
              pierda como en un set de 4 horas a las 6AM.
            </div>

            {/* mini CTA lateral */}
            <div className="rounded-xl border border-zinc-800 p-5 bg-black/40 space-y-3">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Acceso rápido
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  href="/booking"
                  className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-black hover:opacity-90 transition"
                >
                  Booking
                </Link>
                <Link
                  href="/work"
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                >
                  Archivo
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                >
                  Contacto
                </Link>
              </div>

              <div className="text-xs text-zinc-500">
                IG:{" "}
                <a
                  className="text-zinc-300 hover:text-white transition"
                  href="https://www.instagram.com/elvasco.x"
                  target="_blank"
                  rel="noreferrer"
                >
                  @elvasco.x
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
