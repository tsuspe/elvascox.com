// src/app/search/page.tsx
import { prisma } from "@/lib/prisma";
import { searchSitePages } from "@/lib/siteIndex";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

function normalizeTxt(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = (await searchParams) ?? {};
  const query = (q ?? "").trim();

  const normalized = normalizeTxt(query);
  const isValidQuery = normalized.length >= 2;

  const pageResults = isValidQuery ? await searchSitePages(query, 6) : [];

  const workResults = isValidQuery
    ? await prisma.work.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
            {
              tags: {
                some: {
                  tag: { name: { contains: query } },
                },
              },
            },
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take: 30,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          type: true,
          publishedAt: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
      })
    : [];

  const total = pageResults.length + workResults.length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Search</div>
        <h1 className="text-3xl font-black tracking-tight">
          Buscar en el archivo<span className="text-red-500">.</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Prueba con tags, estilos, bandas, técnicas, localizaciones… lo que te salga.
        </p>
      </header>

      <form className="flex gap-2" action="/search" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="blackout, acid, film, patterns..."
          className="w-full rounded-lg border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
        />
        <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition">
          Buscar
        </button>
      </form>

      {query ? (
        <div className="text-sm text-zinc-500">
          {!isValidQuery ? (
            <>
              Escribe al menos <span className="text-zinc-200">2 caracteres</span>.
            </>
          ) : total ? (
            <>
              {total} resultados para <span className="text-zinc-200">“{query}”</span>
            </>
          ) : (
            <>
              Sin resultados para <span className="text-zinc-200">“{query}”</span>
            </>
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-600">Escribe algo para empezar.</div>
      )}

      {pageResults.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Páginas</div>

          <div className="grid gap-3">
            {pageResults.map((p: any) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-zinc-900 hover:border-zinc-700 transition p-4 bg-black/20"
              >
                <div className="text-xs uppercase tracking-wide text-zinc-500">Página</div>
                <div className="mt-1 text-zinc-200 font-semibold">{p.title}</div>
                {p.excerpt ? (
                  <div className="mt-1 text-sm text-zinc-500">{p.excerpt}</div>
                ) : p.description ? (
                  <div className="mt-1 text-sm text-zinc-500">{p.description}</div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {workResults.length ? (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Archivo</div>

          <div className="grid gap-3">
            {workResults.map((r) => (
              <Link
                key={r.id}
                href={`/work/${r.slug}`}
                className="rounded-xl border border-zinc-900 hover:border-zinc-700 transition p-4 bg-black/20"
              >
                <div className="text-xs uppercase tracking-wide text-zinc-500">{r.type}</div>
                <div className="mt-1 text-zinc-200 font-semibold">{r.title}</div>
                {r.excerpt ? <div className="mt-1 text-sm text-zinc-500">{r.excerpt}</div> : null}
                {r.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.tags.slice(0, 4).map((t) => (
                      <span
                        key={t.tag.name}
                        className="text-[11px] rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {isValidQuery && !pageResults.length && !workResults.length ? (
        <div className="rounded-xl border border-zinc-900 bg-black/20 p-4 text-sm text-zinc-500">
          Prueba variaciones: <span className="text-zinc-200">blackwork</span>,{" "}
          <span className="text-zinc-200">blackout</span>,{" "}
          <span className="text-zinc-200">acid</span>,{" "}
          <span className="text-zinc-200">techno</span>,{" "}
          <span className="text-zinc-200">film</span>.
        </div>
      ) : null}
    </section>
  );
}
