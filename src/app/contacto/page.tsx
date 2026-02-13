// src/app/contacto/page.tsx
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const EMAIL = "info@elvascox.com";
const INSTAGRAM = "https://www.instagram.com/elvasco.x";
const YOUTUBE = "https://youtube.com/@elvasco.x";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/contacto");

  return {
    title: "Contacto · elvasco.x",
    description:
      "Contacto para tattoo, film, música o colaboraciones. Brief claro, respuesta honesta. Email, booking e Instagram DM.",
    alternates: { canonical },
    openGraph: {
      title: "Contacto · elvasco.x",
      description:
        "Contacto para tattoo, film, música o colaboraciones. Brief claro, respuesta honesta. Email, booking e Instagram DM.",
      url: canonical,
      type: "website",
    },
  };
}

export default function ContactoPage() {
  const canonical = siteUrl("/contacto");

  // JSON-LD: ContactPage + Person (mínimo útil y coherente)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto · elvasco.x",
    url: canonical,
    description:
      "Contacto para tattoo, film, música o colaboraciones. Email, booking e Instagram DM.",
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
      email: `mailto:${EMAIL}`,
      sameAs: [INSTAGRAM, YOUTUBE],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: EMAIL,
          availableLanguage: ["es"],
        },
      ],
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 space-y-10">
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
        <span className="text-zinc-300">Contacto</span>
      </div>

      {/* HERO */}
      <header className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          contacto<span className="text-red-500">.</span>
        </div>

        <h1 className="leading-[0.95]">
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            Si esto te habla<span className="text-red-500">,</span>
          </span>
          <span className="block text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-500">
            lo siguiente es fácil<span className="text-red-500">.</span>
          </span>
        </h1>

        <p className="text-zinc-400 max-w-2xl leading-relaxed">
          Tattoo / Film / Música. Sin postureo: dime qué necesitas y te digo si
          encaja.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/booking"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Reservar / Tattoo
          </Link>

          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(
              "Contacto · elvasco.x"
            )}`}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
          >
            Escribir por email
          </a>

          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Instagram DM →
          </a>
        </div>
      </header>

      {/* CARDS */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Tattoo */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3 relative overflow-hidden glitch-frame glitch-bar">
          <div className="text-sm font-semibold text-zinc-100">Tattoo</div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Para pedir cita, mejor por{" "}
            <span className="text-zinc-200">Booking</span>. Si me escribes,
            incluye:
          </p>

          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• Zona del cuerpo + tamaño aprox.</li>
            <li>• Idea / referencias (si las hay).</li>
            <li>• Ciudad + fechas posibles.</li>
            <li>• Tu presupuesto realista (sin miedo).</li>
          </ul>

          <div className="pt-2 flex gap-3">
            <Link href="/booking" className="text-sm text-zinc-200 hover:text-white transition">
              Ir a Booking →
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-0 glitch-hover" />
        </div>

        {/* Colabs / Film / Música */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3 relative overflow-hidden glitch-frame glitch-bar">
          <div className="text-sm font-semibold text-zinc-100">
            Colabs / Film / Música
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Si es curro o colaboración, vamos al grano. Mándame un brief:
          </p>

          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• Qué quieres conseguir (objetivo).</li>
            <li>• Referencias (visual/sonido) + tono.</li>
            <li>• Plazo y presupuesto.</li>
            <li>• Entregables (vídeo, fotos, música, etc.).</li>
          </ul>

          <div className="pt-2 flex gap-3">
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                "Colab / Proyecto · elvasco.x"
              )}`}
              className="text-sm text-zinc-200 hover:text-white transition"
            >
              Enviar brief por email →
            </a>
          </div>

          <div className="pointer-events-none absolute inset-0 glitch-hover" />
        </div>

        {/* Comunidad */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-3 relative overflow-hidden glitch-frame glitch-bar">
          <div className="text-sm font-semibold text-zinc-100">Comunidad</div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Si vienes por las notas, el proceso o el universo visual, aquí tienes
            las puertas.
          </p>

          <div className="space-y-2 text-sm">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
            >
              Instagram → DM / Reels
            </a>

            <a
              href={YOUTUBE}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
            >
              YouTube → piezas largas
            </a>

            <Link
              href="/journal"
              className="block rounded-lg border border-zinc-800 bg-black/20 px-3 py-2 text-zinc-300 hover:border-zinc-600 transition"
            >
              Journal → notas sin filtro
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-0 glitch-hover" />
        </div>
      </section>

      {/* MINI FAQ */}
      <section className="rounded-2xl border border-zinc-800 bg-black/20 p-6 space-y-3">
        <div className="text-sm font-semibold text-zinc-100">
          Antes de escribir<span className="text-red-500">.</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2 text-sm text-zinc-400">
          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Respuesta</div>
            <div className="mt-1">
              Suelo responder en 24–72h. Si es urgente, pon{" "}
              <span className="text-zinc-200">URGENTE</span> en el asunto.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Qué NO hago</div>
            <div className="mt-1">
              Copias exactas de tattoos ajenos / diseños sin alma. Prefiero
              construir algo contigo.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Cómo decir “sí” rápido</div>
            <div className="mt-1">
              Brief claro + referencias + fechas + presupuesto. Eso es música.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Privacidad</div>
            <div className="mt-1">
              Lo que me cuentas se queda aquí. Cero show con tu historia.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
        <div className="text-sm text-zinc-400">
          <span className="text-zinc-200 font-semibold">elvasco</span>
          <span className="text-red-500">.</span>
          <span className="text-red-500">x</span>
          <span className="text-zinc-600"> · </span>
          <span className="text-zinc-500">Underground by choice</span>
          <span className="text-red-500"> ✖️</span>
        </div>

        <div className="mt-3 text-sm text-zinc-400">
          Email:{" "}
          <a className="text-zinc-200 hover:text-white transition" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
