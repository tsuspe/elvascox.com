// src/app/layout.tsx
import { Suspense } from "react";

import { Analytics } from "@vercel/analytics/react";


import AssistantDrawerClient from "@/components/AssistantDrawerClient";
import HeaderSearchClient from "@/components/HeaderSearchClient";
import NavClient from "@/components/NavClient";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";
import "./glitch.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl("/")),
  title: {
    default: "elvasco.x — Plataforma creativa",
    template: "%s · elvasco.x",
  },
  description: "Tattoo / Música / Arte / Film + IA. Underground by choice.",
  openGraph: {
    title: "elvasco.x — Plataforma creativa",
    description: "Tattoo / Música / Arte / Film + IA. Underground by choice.",
    url: siteUrl("/"),
    siteName: "elvasco.x",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "elvasco.x — Plataforma creativa",
    description: "Tattoo / Música / Arte / Film + IA. Underground by choice.",
  },
};

export const viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
};

const nav = [
  { href: "/work", label: "Archivo" },
  { href: "/tattoo", label: "Tattoo" },
  { href: "/musica", label: "Música" },
  { href: "/film", label: "Film" },
  { href: "/arte", label: "Arte" },
  { href: "/dev", label: "Dev+AI" },
  { href: "/journal", label: "Journal" },
  { href: "/bio", label: "Bio" },
  { href: "/contacto", label: "Contacto" },
];

function buildWebSiteJsonLd() {
  const base = siteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "elvasco.x",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = buildWebSiteJsonLd();

  return (
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}>
      <body className="min-h-screen bg-black text-zinc-100">
        {/* JSON-LD global: WebSite + SearchAction */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              elvasco<span className="text-red-500">.</span>
              <span className="text-red-500">x</span>
            </Link>

            <NavClient nav={nav} />

            <div className="flex items-center gap-2">
              <HeaderSearchClient />

              <Link
                href="/booking"
                className="hidden sm:inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-sm transition hover:border-zinc-500"
              >
                Booking
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>

        <footer className="border-t border-zinc-900 py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-5 text-sm text-zinc-500">
            <span>© {new Date().getFullYear()} elvasco.x · Underground by choice.</span>
            <span className="ml-auto hidden sm:inline">
              Madrid ↔️ Euskadi | Chile (Soon)· Negro como lenguaje.
            </span>
          </div>
        </footer>

        {/* Botón + drawer del asistente (usa useSearchParams -> necesita Suspense) */}
        <Suspense fallback={null}>
          <AssistantDrawerClient />
        </Suspense>

        {/* Vercel Web Analytics */}
        <Analytics />

      </body>
    </html>
  );
}
