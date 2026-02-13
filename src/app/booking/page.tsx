// src/app/booking/page.tsx
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const EMAIL = "info@elvascox.com";
const WHATSAPP_E164 = "+34682714237"; // sin espacios
const WHATSAPP_DISPLAY = "+34 682 714 237";

function waLink(text: string) {
  const phone = WHATSAPP_E164.replace(/[^\d]/g, ""); // solo dígitos
  const base = `https://wa.me/${phone}`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

// Template largo (email) + versión corta (WhatsApp) por límites prácticos
const TEMPLATE_EMAIL = `BOOKING · elvasco.x

1) Zona del cuerpo:
2) Tamaño aprox (cm):
3) Estilo / idea (2-3 líneas):
4) Referencias (links o adjuntos):
5) Ciudad + fechas posibles:
6) Presupuesto realista:
7) Tu nombre + Instagram:

Extras (si aplica):
- Coberturas / scars / piel sensible:
- Si es cover-up: foto clara de la zona
`;

const TEMPLATE_WA = `BOOKING · elvasco.x
1) Zona + tamaño (cm):
2) Idea (2-3 líneas):
3) Referencias:
4) Ciudad + fechas:
5) Presupuesto:
6) Nombre + IG:
(Extras: cover-up/scars/piel sensible)`;

// mailto helper (por si luego lo reutilizas)
function mailtoBooking(body: string) {
  const subject = "Booking Tattoo · elvasco.x";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/booking");

  return {
    title: "Booking Tattoo · elvasco.x",
    description:
      "Reserva tattoo con plantilla clara. Email o WhatsApp. Menos ida/vuelta: zona, tamaño, idea, referencias, fechas y presupuesto.",
    alternates: { canonical },
    openGraph: {
      title: "Booking Tattoo · elvasco.x",
      description:
        "Reserva tattoo con plantilla clara. Email o WhatsApp. Zona, tamaño, idea, referencias, fechas y presupuesto.",
      url: canonical,
      type: "website",
    },
  };
}

export default function BookingPage() {
  const canonical = siteUrl("/booking");

  // JSON-LD: Service (Tattoo) + provider + contact points
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tattoo booking · elvasco.x",
    serviceType: "Tattoo",
    url: canonical,
    description:
      "Reserva tattoo con plantilla clara. Email o WhatsApp. Zona, tamaño, idea, referencias, fechas y presupuesto.",
    areaServed: [
      { "@type": "Country", name: "España" },
      { "@type": "AdministrativeArea", name: "Madrid" },
    ],
    provider: {
      "@type": "Person",
      name: "El Vasco",
      alternateName: ["elvasco.x", "Elvasco"],
      url: siteUrl("/"),
      sameAs: ["https://www.instagram.com/elvasco.x", "https://youtube.com/@elvasco.x"],
      email: `mailto:${EMAIL}`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "booking",
          email: EMAIL,
          availableLanguage: ["es"],
        },
      ],
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "0",
      description:
        "Consulta inicial por mensaje. Presupuesto según proyecto. Se requiere info mínima para valorar.",
      url: canonical,
      availability: "https://schema.org/InStock",
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

      {/* breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition">
          ← Home
        </Link>
        <span className="text-zinc-700">/</span>
        <Link href="/contacto" className="text-zinc-400 hover:text-zinc-200 transition">
          Contacto
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300">Booking</span>
      </div>

      {/* HERO */}
      <header className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          booking<span className="text-red-500">.</span>
        </div>

        <h1 className="leading-[0.95]">
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            Tattoo booking<span className="text-red-500">.</span>
          </span>
          <span className="block text-2xl sm:text-3xl font-black tracking-tight text-zinc-500">
            directo / claro / sin ruido
          </span>
        </h1>

        <p className="text-zinc-400 max-w-2xl leading-relaxed">
          Para agendar contigo necesito 1 minuto de info bien puesta. Si me mandas esto,
          te respondo rápido y sin ida/vuelta eterna.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={mailtoBooking(TEMPLATE_EMAIL)}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Enviar por Email (plantilla)
          </a>

          <a
            href={waLink(TEMPLATE_WA)}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
          >
            Enviar por WhatsApp (plantilla)
          </a>

          <Link
            href="/work?type=TATTOO"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
          >
            Ver trabajos →
          </Link>
        </div>

        <div className="text-xs text-zinc-500">
          Tip: si es cover-up, mándame foto clara con luz natural. Sin filtros, por favor.{" "}
          <span className="text-red-500">✖</span>
        </div>
      </header>

      {/* MAIN GRID */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Card: datos necesarios */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4 relative overflow-hidden glitch-frame glitch-bar">
          <div className="text-sm font-semibold text-zinc-100">
            Lo que necesito para decirte “sí”
          </div>

          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• Zona del cuerpo + tamaño aprox.</li>
            <li>• Idea / intención (2–3 líneas, sin novela).</li>
            <li>• Referencias (o “quiero que diseñes tú”).</li>
            <li>• Ciudad + fechas posibles.</li>
            <li>• Presupuesto realista (así no perdemos tiempo).</li>
          </ul>

          <div className="text-xs text-zinc-500">
            Si falta info, te pediré lo que falte y tu booking se ralentiza. No es maldad,
            es logística.
          </div>

          <div className="pointer-events-none absolute inset-0 glitch-hover" />
        </div>

        {/* Card: template copy/paste */}
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6 space-y-4 relative overflow-hidden glitch-frame glitch-bar">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-100">Plantilla</div>
            <span className="text-xs text-zinc-500">copy / paste</span>
          </div>

          <pre className="whitespace-pre-wrap rounded-xl border border-zinc-900 bg-black/30 p-4 text-xs text-zinc-300 leading-relaxed">
            {TEMPLATE_EMAIL}
          </pre>

          <div className="flex flex-wrap gap-3">
            <a
              href={waLink(TEMPLATE_WA)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
            >
              Abrir WhatsApp con plantilla →
            </a>

            <a
              href={mailtoBooking(TEMPLATE_EMAIL)}
              className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition"
            >
              Abrir email con plantilla →
            </a>
          </div>

          <div className="pointer-events-none absolute inset-0 glitch-hover" />
        </div>
      </section>

      {/* MINI FAQ */}
      <section className="rounded-2xl border border-zinc-800 bg-black/20 p-6 space-y-3">
        <div className="text-sm font-semibold text-zinc-100">
          Cómo funciona<span className="text-red-500">.</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2 text-sm text-zinc-400">
          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Respuesta</div>
            <div className="mt-1">Normalmente 24–72h. Si es urgente, dilo en el mensaje.</div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Diseño</div>
            <div className="mt-1">Trabajo por proyecto. Si encaja, te propongo dirección y lo construimos.</div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Depósito</div>
            <div className="mt-1">
              (Opcional) Si usas señal/depósito, aquí es donde lo explicas en una frase.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-black/20 p-4">
            <div className="text-zinc-200 font-medium">Qué no hago</div>
            <div className="mt-1">Copias exactas de tattoos ajenos. Prefiero crear contigo algo propio.</div>
          </div>
        </div>

        <div className="pt-2 text-xs text-zinc-500">
          Si vienes a “pedir precio” sin contexto, te voy a pedir contexto. Esto es un estudio, no un kebab.{" "}
          <span className="text-red-500">✖</span>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
        <div className="text-sm text-zinc-400">
          Email:{" "}
          <a className="text-zinc-200 hover:text-white transition" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <div className="mt-2 text-sm text-zinc-400">
          WhatsApp:{" "}
          <a
            className="text-zinc-200 hover:text-white transition"
            href={waLink("Hola! Quiero reservar tattoo.\n\n" + TEMPLATE_WA)}
            target="_blank"
            rel="noreferrer"
          >
            {WHATSAPP_DISPLAY}
          </a>
        </div>
      </section>
    </main>
  );
}
