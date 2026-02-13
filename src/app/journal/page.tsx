// src/app/journal/page.tsx
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

function formatDate(d?: Date | null) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("es-ES");
  } catch {
    return null;
  }
}

/* =========================
   METADATA
========================= */
export async function generateMetadata(): Promise<Metadata> {
  const canonical = siteUrl("/journal");

  const title = "Journal · elvasco.x";
  const description =
    "Reflexiones, proceso, filosofía práctica y vida. Notas sin filtro desde el archivo de elvasco.x.";

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "elvasco.x",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JournalIndexPage() {
  const canonical = siteUrl("/journal");

  /* =========================
     JSON-LD
  ========================= */
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Journal · elvasco.x",
    url: canonical,
    description:
      "Reflexiones, proceso, filosofía práctica y vida. Notas sin filtro desde el archivo de elvasco.x.",
    isPartOf: {
      "@type": "WebSite",
      name: "elvasco.x",
      url: siteUrl("/"),
    },
    mainEntity: {
      "@type": "Collection",
      name: "Journal entries",
      about: ["pensamiento", "proceso", "vida", "filosofía práctica"],
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: canonical,
      },
    ],
  };

  const items = await prisma.work.findMany({
    where: { status: "PUBLISHED", type: "JOURNAL" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      tags: { include: { tag: true } },
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 space-y-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <header className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          journal<span className="text-red-500">.</span>
        </div>

        <h1 className="leading-[0.9]">
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            Notas<span className="text-red-500">.</span>
          </span>
          <span className="block text-2xl sm:text-3xl font-black tracking-tight text-zinc-500">
            pensamiento / proceso / vida
          </span>
        </h1>

        <p className="text-zinc-400 max-w-2xl leading-relaxed">
          Reflexiones, filosofía práctica, construcción, errores y aprendizajes. Sin filtro.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-sm text-zinc-400">
          Aún no hay entradas.
        </div>
      ) : (
        <section className="grid gap-4">
          {items.map((w) => {
            const date = formatDate(w.publishedAt);
            const tagNames = (w.tags ?? []).slice(0, 3).map((t) => t.tag.name);

            return (
              <Link
                key={w.id}
                href={`/work/${w.slug}`}
                className="group block rounded-2xl border border-zinc-800 bg-black/20 p-6 hover:border-zinc-600 transition relative overflow-hidden glitch-frame glitch-bar"
              >
                <div className="text-xl font-semibold text-zinc-100 group-hover:text-white transition">
                  {w.title}
                </div>

                {w.excerpt ? (
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {w.excerpt}
                  </p>
                ) : null}

                {tagNames.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagNames.map((t) => (
                      <span
                        key={t}
                        className="text-xs rounded-full border border-zinc-800 bg-black/10 px-2 py-1 text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 text-xs text-zinc-500">
                  {date ?? "—"} <span className="text-red-500">✖</span>
                </div>

                <div className="pointer-events-none absolute inset-0 glitch-hover" />
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
