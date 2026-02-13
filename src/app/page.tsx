// src/app/page.tsx
import MediaRenderer from "@/components/MediaRenderer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import CTABox from "@/components/evergreen/CTABox";
import SectionHeading from "@/components/evergreen/SectionHeading";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * ✅ TÍTULO BRUTALISTA
 * Elige 1:
 *  - "ELVASCO.X CREATIVE SYSTEMS"
 *  - "ELVASCOX PRODUCCIONES"
 *  - "ELVASCOX PLATAFORM"
 */
const HOME_BRAND = {
  // opción 1
  top: "ELVASCO",
  dot: ".",
  x: "X",
  bottom: "CREATIVE SYSTEMS",
  // top: "ELVASCOX", dot: "", x: "", bottom: "PRODUCCIONES"
  // top: "ELVASCOX", dot: "", x: "", bottom: "PLATAFORM"
};

const HERO = {
  tagline: "Underground by choice. ✖️",
  sub: "Tattoo / Arte / Film / Musica / Full Stack + AI",
  copy: [
    "Si hay algo que une todo lo que hago es la curiosidad. No como hobby, sino como necesidad real de entender cómo funcionan las cosas.",
    "Esta web es el resultado de ese impulso: un lugar donde comparto caminos, pruebas y descubrimientos mientras avanzo.",
  ],
};



const MANIFESTO = [
  "Underground by choice.",
  "Entiende y ama el proceso. Así conseguirás los mejores resultados.",
  "Siempre prioriza el trabajo y el resultado, no tu ego.",
  "Nunca dejes de aprender.",
  "Nunca es suficiente ganancia! O negro!",
];

function formatDate(d?: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return null;
  }
}

function pickCover(media: any[]) {
  return (media?.find((m) => m.isCover) ?? media?.[0]) ?? null;
}

type Pill = { label: string; href: string };
function PillsRow({ pills }: { pills: Pill[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="text-xs rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-zinc-300 hover:border-zinc-600 transition"
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  // Latest drops: lo último publicado (multifaceta)
  const latest = await prisma.work.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 9,
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

  const last = latest?.[0] ?? null;

  // ✅ Featured controlado por tag "home-featured" (el mismo que usa el checkbox del admin)
  const featured = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      tags: {
        some: {
          tag: { slug: "home-featured" },
        },
      },
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

  const quickPills: Pill[] = [
    { label: "Tattoo", href: "/tattoo" },
    { label: "Musica", href: "/musica" },
    { label: "Film", href: "/film" },
    { label: "Arte", href: "/arte" },
    { label: "Dev", href: "/dev" },
    { label: "Archivo", href: "/work" },
    { label: "Bio", href: "/bio" },
  ];

  // Caminos (5 al mismo nivel)
  const caminos = [
    {
      n: "01",
      href: "/tattoo",
      title: "Tattoo",
      desc: "Blackwork / blackout. Composición, respiración y negros con intención.",
      tags: ["blackwork", "blackout", "organic"],
    },
    {
      n: "02",
      href: "/musica",
      title: "Musica",
      desc: "Techno / acid y metal. Groove, tensión y atmósfera.",
      tags: ["acid", "techno", "hardware"],
    },
    {
      n: "03",
      href: "/film",
      title: "Film",
      desc: "Videoclips, docs, VFX y color. Storytelling sin maquillaje.",
      tags: ["filmmaking", "vfx", "grading"],
    },
    {
      n: "04",
      href: "/arte",
      title: "Arte & Photo",
      desc: "Abstracto, prints, procesos y fotografía. Textura > decoración.",
      tags: ["abstract", "prints", "photo"],
    },
    {
      n: "05",
      href: "/dev",
      title: "Full Stack & AI",
      desc: "Webapps, automatizaciones (n8n) e IA aplicada. Sistemas que funcionan.",
      tags: ["nextjs", "prisma", "n8n"],
    },
  ];

  const now = [
    {
      title: "Blackout / patrones orgánicos",
      desc: "Mejorar la técnica, saturación y velocidad siempre está presente en mi mente. Mientras sigo investigando en añadir estructuras y patrones abstractos a mis creaciones.",
    },
    {
      title: "Techno/ live jams",
      desc: "La música es otro motor en mi vida, ahora estoy metido en la creación de música con sintetizadores analógicos. Siempre con la improvisación como camino. Live, no computer.",
    },
    {
      title: "Dev + automations",
      desc: "Desde la llegada de la IA he descubierto herramientas quizás las que me faltaban para dar forma y terminar de crear los procesos que tengo en mente. Programación y app webs.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 space-y-12">
      {/* HERO BRUTALISTA */}
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="block leading-[0.9]">
                <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
                  {HOME_BRAND.top}

                  {(HOME_BRAND.dot || HOME_BRAND.x) ? (
                    <span
                      className="bio-glitch-x"
                      data-text={`${HOME_BRAND.dot ?? ""}${HOME_BRAND.x ?? ""}`}
                      aria-label={`${HOME_BRAND.dot ?? ""}${HOME_BRAND.x ?? ""}`}
                    >
                      <span className="text-red-500">{HOME_BRAND.dot}</span>
                      <span className="text-red-500">{HOME_BRAND.x}</span>
                    </span>
                  ) : null}
                </span>

                <span className="block text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-500">
                  {HOME_BRAND.bottom}
                </span>
              </h1>

              <div className="text-sm text-zinc-400">{HERO.sub}</div>

              <div className="text-sm text-zinc-300">
                <span className="text-zinc-500">→</span>{" "}
                <span>{HERO.tagline.split(" ✖️")[0]}</span>{" "}
                <span className="text-red-500">✖️</span>
              </div>

              <div className="max-w-2xl space-y-3 text-zinc-400 leading-relaxed">
                {HERO.copy.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#latest"
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
              >
                Ver trabajo
              </a>

              <Link
                href="/work"
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Abrir archivo
              </Link>

              <Link
                href="/booking"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition"
              >
                Booking
              </Link>

              <Link
                href="/bio"
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
              >
                Ver Bio
              </Link>
            </div>

            <div className="pt-2">
              <PillsRow pills={quickPills} />
            </div>
          </div>


          {/* Micro-acento editorial: último drop */}
          <div className="hidden sm:block">
            <div className="rounded-xl border border-zinc-900 bg-black/40 px-4 py-3 w-[280px]">
              <div className="text-xs text-zinc-500">último drop</div>

              <div className="mt-1 text-sm text-zinc-300 leading-snug">
                {last ? (
                  <Link
                    href={`/work/${last.slug}`}
                    className="hover:text-white transition"
                    title={last.title}
                  >
                    {last.title} <span className="text-red-500">✖</span>
                  </Link>
                ) : (
                  <span>
                    sin drops aún <span className="text-red-500">✖</span>
                  </span>
                )}
              </div>

              <div className="mt-2 h-px w-20 bg-red-500/20" />

              <div className="mt-2 text-xs text-zinc-500">
                {last?.type ? (
                  <span className="uppercase tracking-wide">{last.type}</span>
                ) : (
                  <span>archivo transversal</span>
                )}
                {last?.publishedAt ? (
                  <span className="text-zinc-700">
                    {" "}
                    · {formatDate(last.publishedAt)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAMINOS (5 al mismo nivel) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Caminos</h2>
          <span className="text-xs text-zinc-500">mapa rápido</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {caminos.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-zinc-800 bg-black/20 hover:border-zinc-600 transition overflow-hidden"
            >
              <div className="relative p-6 h-full flex flex-col">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  CAMINO {c.n}
                </div>

                <div className="mt-3 text-2xl font-semibold text-zinc-100 group-hover:text-white transition">
                  {c.title}
                </div>

                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {c.desc}
                </p>

                {c.tags?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] rounded-full border border-zinc-800 bg-black/20 px-2 py-0.5 text-zinc-400 group-hover:border-zinc-700 transition"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-auto pt-6 text-sm text-zinc-200">
                  <span className="group-hover:text-white transition">
                    Entrar
                  </span>{" "}
                  <span className="text-red-500">→</span>
                </div>

                <div className="pointer-events-none absolute inset-0 glitch-hover" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NOW */}
      <section className="space-y-6">
        <SectionHeading
          id="now"
          title="Now"
          desc="Lo que está vivo ahora mismo (sin humo)."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {now.map((n) => (
            <div
              key={n.title}
              className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
            >
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Focus
              </div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">
                {n.title}
              </div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {n.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED (por tag home-featured) */}
      {featured.length ? (
        <section className="space-y-6">
          <SectionHeading
            id="featured"
            title="Featured"
            desc="Trabajos destacados."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {featured.slice(0, 3).map((w) => {
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
                        featured
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* LATEST DROPS */}
      <section id="latest" className="space-y-5 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            id="lastdrops"
            title="Latest drops"
            desc="Aquí verás las últimas publicaciones. Si quieres pásate por el archivo para ver más."
          />
          <Link
            href="/work"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            Ver archivo →
          </Link>
        </div>

        {latest.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((w) => {
              const cover = pickCover(w.media as any[]);
              const tagNames = (w.tags ?? [])
                .slice(0, 3)
                .map((t) => t.tag.name);
              const dateLabel = formatDate(w.publishedAt);

              return (
                <Link
                  key={w.id}
                  href={`/work/${w.slug}`}
                  className="group rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition relative glitch-frame glitch-bar"
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-black">
                      <MediaRenderer
                        media={cover as any}
                        className="h-full w-full"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" />
                  )}

                  <div className="mt-3 space-y-1">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      {w.type}
                      {dateLabel ? (
                        <span className="text-zinc-600"> · {dateLabel}</span>
                      ) : null}
                    </div>

                    <div className="font-semibold leading-tight group-hover:text-white transition">
                      {w.title}
                    </div>

                    {w.excerpt ? (
                      <p className="text-sm text-zinc-400 line-clamp-2">
                        {w.excerpt}
                      </p>
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

                  <div className="pointer-events-none absolute inset-0 glitch-hover" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">
            Aún no hay drops publicados.
          </div>
        )}
      </section>

      {/* MINI MANIFIESTO */}
      <section className="rounded-xl border border-zinc-800 p-5 bg-black/40 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Manifiesto</h2>
          <Link
            href="/bio"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            leer más →
          </Link>
        </div>

        <ul className="space-y-2 text-zinc-300">
          {MANIFESTO.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-red-500/80">✖</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CÓMO TRABAJO */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Cómo trabajo</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: "01", t: "Idea / referencia", d: "Todo parte de una idea, o referencia. Cuanto más precisa mejor." },
            { n: "02", t: "Diseño / sistema", d: "Se plantea la idea, se buscan otras opciones, hacemos pruebas y escogemos la que mejor se adapte a lo que queremos conseguir" },
            { n: "03", t: "Ejecución + proceso", d: "Poner todo el conocimiento adquirido en práctica, mantener buena comunicación durante el proceso, documentarlo. Repasarlo si hiciera falta." },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-zinc-800 p-5 bg-black/40"
            >
              <div className="text-xs text-zinc-500">{s.n}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-zinc-400">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/contacto"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition"
          >
            Contacto
          </Link>
          <Link
            href="/booking"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Booking
          </Link>
        </div>
      </section>

      {/* CTA / CONTACTO */}
      <section className="space-y-6">
        <CTABox
          title="Contacto / Booking"
          desc="Tattoo, visuales, música, webapps o automatizaciones. Filmmaking Si quieres profundizar o colaborar en cualquiera de estos temas escríbeme y hablamos."
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
                <a
                  className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub (placeholder)
                </a>
              </div>
            </div>
          }
        />
      </section>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-zinc-900 text-xs text-zinc-500 flex flex-wrap gap-3">
        <Link href="/tattoo" className="hover:text-zinc-300 transition">
          Tattoo
        </Link>
        <Link href="/arte" className="hover:text-zinc-300 transition">
          Arte
        </Link>
        <Link href="/film" className="hover:text-zinc-300 transition">
          Film
        </Link>
        <Link href="/musica" className="hover:text-zinc-300 transition">
          Musica
        </Link>
        <Link href="/dev" className="hover:text-zinc-300 transition">
          Dev+AI
        </Link>
        <Link href="/work" className="hover:text-zinc-300 transition">
          Archivo
        </Link>
        <Link href="/bio" className="hover:text-zinc-300 transition">
          Bio
        </Link>
        <Link href="/contacto" className="hover:text-zinc-300 transition">
          Contacto
        </Link>
        <Link href="/booking" className="hover:text-zinc-300 transition">
          Booking
        </Link>
        <span className="ml-auto">
          © {new Date().getFullYear()} elvasco.x · Underground by choice.
        </span>
      </footer>
    </main>
  );
}
