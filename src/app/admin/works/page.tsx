// src/app/admin/works/page.tsx
import { prisma } from "@/lib/prisma";
import { reindexSitePages } from "@/lib/siteIndexReindex";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WorkStatus, WorkType } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";


function pickCover(
  media: Array<{ isCover?: boolean; url: string }> | undefined
) {
  if (!media?.length) return null;
  return (media.find((m) => m.isCover) ?? media[0]) ?? null;
}

function fmt(d?: Date | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("es-ES");
  } catch {
    return "";
  }
}

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function badgeTone(status: string) {
  if (status === "PUBLISHED") return "border-emerald-700/60 text-emerald-200";
  if (status === "DRAFT") return "border-amber-700/60 text-amber-200";
  if (status === "ARCHIVED") return "border-zinc-700 text-zinc-300";
  return "border-zinc-700 text-zinc-300";
}

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

async function reindexNow(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) redirect("/admin/login");

  const rawReturn = String(formData.get("return") ?? "/admin/works");
  const safeReturn = rawReturn.startsWith("/admin/works") ? rawReturn : "/admin/works";
  const joiner = safeReturn.includes("?") ? "&" : "?";

  try {
    const count = await reindexSitePages();
    redirect(`${safeReturn}${joiner}reindex=ok&count=${count}`);
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : typeof err === "string" ? err : "reindex_error";
    const msg = encodeURIComponent(raw.slice(0, 120));
    console.error("[reindex] failed from /admin/works", err);
    redirect(`${safeReturn}${joiner}reindex=err&reindex_msg=${msg}`);
  }
}

export default async function AdminWorksPage({ searchParams }: PageProps) {
  const sp: SearchParams = searchParams ? await searchParams : {};
  const qRaw = sp["q"];
  const typeRaw = sp["type"];
  const statusRaw = sp["status"];
  const reindex = String(sp["reindex"] ?? "");
  const count = String(sp["count"] ?? "");
  const reindexMsg = String(sp["reindex_msg"] ?? "");


  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw ?? "").trim();
  const type = (Array.isArray(typeRaw) ? typeRaw[0] : typeRaw ?? "").trim();
  const status = (Array.isArray(statusRaw) ? statusRaw[0] : statusRaw ?? "").trim();

  const where: any = {};

  if (type && Object.values(WorkType).includes(type as any)) {
    where.type = type as WorkType;
  }
  if (status && Object.values(WorkStatus).includes(status as any)) {
    where.status = status as WorkStatus;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { slug: { contains: q } },
      { excerpt: { contains: q } },
    ];
  }

  const [works, countsByType, countsByStatus] = await Promise.all([
    prisma.work.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 200,
      include: {
        tags: { include: { tag: true } },
        media: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.work.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.work.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countType = (t: string) =>
    countsByType.find((x) => x.type === t)?._count?._all ?? 0;

  const countStatus = (s: string) =>
    countsByStatus.find((x) => x.status === s)?._count?._all ?? 0;

  const buildHref = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const curQ = q || undefined;
    const curType = type || undefined;
    const curStatus = status || undefined;

    const finalQ = next.q ?? curQ;
    const finalType = next.type ?? curType;
    const finalStatus = next.status ?? curStatus;

    if (finalQ) params.set("q", finalQ);
    if (finalType) params.set("type", finalType);
    if (finalStatus) params.set("status", finalStatus);

    const s = params.toString();
    return s ? `/admin/works?${s}` : "/admin/works";
  };
  const returnUrl = buildHref({ q: q || undefined, type: type || undefined, status: status || undefined });

  const typeTabs: Array<{ label: string; value?: string }> = [
    { label: `All (${works.length}${q || type || status ? "" : ""})`, value: undefined },
    { label: `Journal (${countType("JOURNAL")})`, value: "JOURNAL" },
    { label: `Tattoo (${countType("TATTOO")})`, value: "TATTOO" },
    { label: `Music (${countType("MUSIC")})`, value: "MUSIC" },
    { label: `Film (${countType("FILM")})`, value: "FILM" },
    { label: `Dev (${countType("DEV")})`, value: "DEV" },
    { label: `Art (${countType("ART")})`, value: "ART" },
  ].filter((t) => (t.value ? Object.values(WorkType).includes(t.value as any) : true));

  const statusTabs: Array<{ label: string; value?: string }> = [
    { label: `All`, value: undefined },
    { label: `Published (${countStatus("PUBLISHED")})`, value: "PUBLISHED" },
    { label: `Draft (${countStatus("DRAFT")})`, value: "DRAFT" },
    { label: `Archived (${countStatus("ARCHIVED")})`, value: "ARCHIVED" },
  ].filter((s) => (s.value ? Object.values(WorkStatus).includes(s.value as any) : true));

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Works</h1>
          <div className="text-sm text-zinc-500">
            Todo el contenido vive aquí (incluye Journal). Filtros + búsqueda para no volverte loco.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={reindexNow}>
            <input type="hidden" name="return" value={returnUrl} />
            <button className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition">
              Reindexar sitio
            </button>
          </form>
          <Link
            href="/admin/works/new"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            + New Work
          </Link>

          {/* atajo: nuevo Journal (preselección por querystring) */}
          <Link
            href="/admin/works/new?type=JOURNAL"
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
          >
            + New Journal
          </Link>

          <Link
            href="/journal"
            className="rounded-lg border border-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700 transition"
          >
            Ver Journal público →
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
          {reindexMsg ? (
            <div className="mt-1 text-xs text-red-300">
              {decodeURIComponent(reindexMsg)}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Tabs Type */}
      <div className="flex flex-wrap gap-2">
        {typeTabs.map((t) => {
          const active = (t.value ?? "") === (type ?? "");
          return (
            <Link
              key={t.label}
              href={buildHref({ type: t.value ?? "" , q: q || undefined, status: status || undefined })}
              className={cx(
                "rounded-full border px-3 py-1 text-xs transition",
                active
                  ? "border-red-500/60 bg-red-500/10 text-zinc-100"
                  : "border-zinc-800 bg-black/20 text-zinc-400 hover:border-zinc-600"
              )}
            >
              {t.label}
            </Link>
          );
        })}
        {(type || status || q) ? (
          <Link
            href="/admin/works"
            className="rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 transition"
          >
            limpiar ✖
          </Link>
        ) : null}
      </div>

      {/* Tabs Status + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((s) => {
            const active = (s.value ?? "") === (status ?? "");
            return (
              <Link
                key={s.label}
                href={buildHref({ status: s.value ?? "", q: q || undefined, type: type || undefined })}
                className={cx(
                  "rounded-full border px-3 py-1 text-xs transition",
                  active
                    ? "border-zinc-600 bg-black/40 text-zinc-100"
                    : "border-zinc-900 bg-black/20 text-zinc-400 hover:border-zinc-600"
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        <form action="/admin/works" method="get" className="flex items-center gap-2">
          {/* mantener filtros al buscar */}
          {type ? <input type="hidden" name="type" value={type} /> : null}
          {status ? <input type="hidden" name="status" value={status} /> : null}

          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por título / slug / excerpt…"
            className="w-72 max-w-[70vw] rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* List */}
      {works.length ? (
        <div className="grid gap-3">
          {works.map((w) => {
            const cover = pickCover(w.media as any);
            const tagNames = w.tags.map((t) => t.tag.name).slice(0, 4);

            return (
              <Link
                key={w.id}
                href={`/admin/works/${w.id}`}
                className="rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition bg-black/20"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0">
                    {cover ? (
                      <img
                        src={cover.url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="uppercase tracking-wide">{w.type}</span>
                      <span className="text-zinc-700">·</span>

                      <span
                        className={cx(
                          "uppercase tracking-wide rounded-full border px-2 py-0.5",
                          badgeTone(w.status)
                        )}
                      >
                        {w.status}
                      </span>

                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-500 truncate">{w.slug}</span>

                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-600">
                        updated {fmt(w.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-1 font-semibold text-zinc-200 truncate">
                      {w.title}
                    </div>

                    {w.excerpt ? (
                      <div className="mt-1 text-sm text-zinc-400 line-clamp-2">
                        {w.excerpt}
                      </div>
                    ) : null}

                    {tagNames.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
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

                  <div className="text-sm text-zinc-500">editar →</div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400">
          No hay resultados con estos filtros. Prueba a limpiar o buscar otra cosa.
        </div>
      )}
    </section>
  );
}
