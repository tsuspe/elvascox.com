// src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { reindexSitePages } from "@/lib/siteIndexReindex";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmt(d?: Date | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("es-ES");
  } catch {
    return "";
  }
}

async function reindexNow() {
  "use server";

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) redirect("/admin/login");

  try {
    const count = await reindexSitePages();
    redirect(`/admin?reindex=ok&count=${count}`);
  } catch {
    redirect("/admin?reindex=err");
  }
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams?: Promise<{ reindex?: string; count?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const reindex = String(sp.reindex ?? "");
  const count = String(sp.count ?? "");

  const [counts, latest] = await Promise.all([
    prisma.work.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.work.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const countOf = (status: string) =>
    counts.find((c) => c.status === status)?._count?._all ?? 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Works</h1>
          <p className="text-sm text-zinc-500">
            Todo el contenido se gestiona como Work (incluye Journal).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={reindexNow}>
            <button className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition">
              Reindexar sitio
            </button>
          </form>
          <Link
            href="/admin/works/new"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            + Nuevo Work
          </Link>
          <Link
            href="/admin/works"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
          >
            Ver lista
          </Link>
        </div>
      </div>

      {reindex === "ok" ? (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          Índice actualizado. {count ? `${count} entradas.` : ""}
        </div>
      ) : null}
      {reindex === "err" ? (
        <div className="rounded-xl border border-red-800 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          Error reindexando. Prueba de nuevo.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5">
          <div className="text-xs text-zinc-500">PUBLISHED</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-100">
            {countOf("PUBLISHED")}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5">
          <div className="text-xs text-zinc-500">DRAFT</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-100">
            {countOf("DRAFT")}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-black/20 p-5">
          <div className="text-xs text-zinc-500">ARCHIVED</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-100">
            {countOf("ARCHIVED")}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Últimos edits</div>
          <Link
            href="/admin/works"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            ver todo →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-zinc-400">No hay works aún.</p>
        ) : (
          <div className="space-y-3">
            {latest.map((w) => (
              <Link
                key={w.id}
                href={`/admin/works/${w.id}`}
                className="block rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-100 truncate">
                      {w.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 truncate">
                      /work/{w.slug}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-zinc-400">
                      {w.type} · {w.status}
                    </div>
                    <div className="text-xs text-zinc-600">{fmt(w.updatedAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
