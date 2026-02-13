// src/app/admin/works/new/page.tsx
import WorkMediaFields from "@/components/admin/WorkMediaFields";
import { ensureBaseTags } from "@/lib/ensureBaseTags";
import { prisma } from "@/lib/prisma";
import { reindexSitePages } from "@/lib/siteIndexReindex";
import { WORK_RULES } from "@/lib/workRules";
import { WorkStatus, WorkType } from "@prisma/client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "");
}

function guessMediaKind(url: string) {
  const u = url.toLowerCase().trim();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "embed";
  if (u.includes("/video/upload/")) return "video";
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov"))
    return "video";
  return "image";
}

function parseLines(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function uniqueLines(lines: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of lines.map((x) => x.trim()).filter(Boolean)) {
    if (seen.has(l)) continue;
    seen.add(l);
    out.push(l);
  }
  return out;
}

function errToMsg(err: unknown) {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "reindex_error";
  return encodeURIComponent(raw.slice(0, 120));
}

async function createWork(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const type = String(formData.get("type") ?? "ART") as WorkType;
  const status = String(formData.get("status") ?? "PUBLISHED") as WorkStatus;

  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();

  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);
  const featuredChecked =
    String(formData.get("featured") ?? "").toLowerCase() === "on";

  const galleryUrlsRaw = parseLines(String(formData.get("galleryUrls") ?? ""));
  const galleryUrls = uniqueLines(galleryUrlsRaw).filter((u) => u !== coverUrl);

  if (!title) throw new Error("title requerido");

  const slug = normalizeSlug(slugRaw || title);
  if (!slug) throw new Error("slug inválido");

  const isJournal = type === "JOURNAL";
  if (!isJournal && !coverUrl) throw new Error("coverUrl requerido");

  // ✅ media: si no hay cover, no creamos media (Journal solo texto)
  const mediaToCreate = coverUrl
    ? [
        {
          kind: guessMediaKind(coverUrl),
          url: coverUrl,
          alt: coverAlt || null,
          width: 1400,
          height: 900,
          order: 0,
          isCover: true,
        },
        ...galleryUrls.map((url, idx) => ({
          kind: guessMediaKind(url),
          url,
          alt: null,
          width: 1400,
          height: 900,
          order: idx + 1,
          isCover: false,
        })),
      ]
    : [];

  await ensureBaseTags(prisma);

  const finalTagIds = [...tagIds];

  if (featuredChecked) {
    const featuredTag = await prisma.tag.upsert({
      where: { slug: "home-featured" },
      update: {},
      create: { slug: "home-featured", name: "Home featured" },
      select: { id: true },
    });
    if (!finalTagIds.includes(featuredTag.id)) finalTagIds.push(featuredTag.id);
  }

  if (isJournal) {
    const journalTag = await prisma.tag.upsert({
      where: { slug: "journal" },
      update: {},
      create: { slug: "journal", name: "Journal" },
      select: { id: true },
    });
    if (!finalTagIds.includes(journalTag.id)) finalTagIds.push(journalTag.id);
  }

  const created = await prisma.work.create({
    data: {
      slug,
      title,
      excerpt: excerpt || null,
      content: content || null,
      type,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: finalTagIds.length
        ? { create: finalTagIds.map((id) => ({ tagId: id })) }
        : undefined,
      media: mediaToCreate.length ? { create: mediaToCreate as any } : undefined,
    },
    select: { id: true },
  });

  let reindexParam = "";
  if (status === "PUBLISHED") {
    try {
      await reindexSitePages();
      reindexParam = "&reindex=ok&pub=1";
    } catch (err) {
      console.error("[reindex] failed on create", err);
      reindexParam = `&reindex=err&pub=1&reindex_msg=${errToMsg(err)}`;
    }
  }

  redirect(`/admin/works/${created.id}?ok=created${reindexParam}`);
}

function TagPill({ slug }: { slug: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700/70 bg-black/30 px-2 py-0.5 text-[12px] text-zinc-200">
      {slug}
    </span>
  );
}

function RuleCard({
  title,
  route,
  type,
  status,
  required,
  optional,
  notes,
}: {
  title: string;
  route?: string;
  type: WorkType;
  status: WorkStatus;
  required: string[];
  optional?: string[];
  notes?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-5 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-zinc-100">{title}</div>
          {route ? <div className="text-xs text-zinc-500">{route}</div> : null}
        </div>
        <div className="text-xs text-zinc-500">
          Type: <span className="text-zinc-300">{type}</span> · Status:{" "}
          <span className="text-zinc-300">{status}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Requeridos (todos)
        </div>
        <div className="flex flex-wrap gap-2">
          {required.map((s) => (
            <TagPill key={s} slug={s} />
          ))}
        </div>
      </div>

      {optional?.length ? (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            Opcionales
          </div>
          <div className="flex flex-wrap gap-2">
            {optional.map((s) => (
              <TagPill key={s} slug={s} />
            ))}
          </div>
        </div>
      ) : null}

      {notes ? <div className="text-xs text-zinc-500">{notes}</div> : null}
    </div>
  );
}

function TagsCheatSheet() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Chuleta
        </div>
        <div className="h-px flex-1 bg-zinc-900" />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
        <div className="text-sm text-zinc-300">
          Regla base: si no está{" "}
          <span className="text-zinc-100 font-medium">PUBLISHED</span>, no sale
          en el público. Luego cada página filtra por{" "}
          <span className="text-zinc-100 font-medium">Type</span> y{" "}
          <span className="text-zinc-100 font-medium">tags</span>.
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Consejo: mantén siempre el tag “de dominio” (music / tattoo / art /
          film / dev / journal) para búsquedas y feed transversal.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {WORK_RULES.map((r) => (
          <RuleCard
            key={r.key}
            title={r.title}
            route={r.route}
            type={r.type}
            status={r.status}
            required={r.requiredTags}
            optional={r.optionalTags}
            notes={r.notes}
          />
        ))}
      </div>
    </section>
  );
}

function safeEnum<T extends Record<string, string>>(
  enumObj: T,
  value: string | undefined,
  fallback: T[keyof T]
) {
  if (!value) return fallback;
  const values = Object.values(enumObj);
  return (values.includes(value) ? value : fallback) as T[keyof T];
}

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function NewWorkPage({ searchParams }: PageProps) {
  const sp: SearchParams = searchParams ? await searchParams : {};
  const typeParamRaw = sp["type"];
  const statusParamRaw = sp["status"];

  const typeParam = (Array.isArray(typeParamRaw) ? typeParamRaw[0] : typeParamRaw) as
    | string
    | undefined;

  const statusParam = (Array.isArray(statusParamRaw) ? statusParamRaw[0] : statusParamRaw) as
    | string
    | undefined;

  const defaultType = safeEnum(WorkType as any, typeParam, "ART" as any) as WorkType;
  const defaultStatus = safeEnum(WorkStatus as any, statusParam, "PUBLISHED" as any) as WorkStatus;

  // ✅ autocura tags en DB (si está vacía, crea el vocabulario base)
  await ensureBaseTags(prisma);

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const featuredTag = await prisma.tag.findUnique({
    where: { slug: "home-featured" },
    select: { id: true },
  });

  const isJournal = defaultType === "JOURNAL";

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">New Work</h1>
        <p className="text-sm text-zinc-500">
          Crea una pieza del archivo (Work).{" "}
          {isJournal ? (
            <span className="text-zinc-400">
              (Modo Journal: cover opcional, foco en texto.)
            </span>
          ) : null}
        </p>
      </header>

      <TagsCheatSheet />

      <form action={createWork} className="space-y-5">
        {/* lo mantenemos por compat, aunque ya no dependemos de esto */}
        <input type="hidden" name="featuredTagId" value={featuredTag?.id ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Título</label>
            <input
              name="title"
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              placeholder={isJournal ? "Ej: Sobre disciplina y caos" : "Ej: Blackout flow study"}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Slug (opcional)</label>
            <input
              name="slug"
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              placeholder="si lo dejas vacío, sale del título"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Tipo</label>
            <select
              name="type"
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              defaultValue={defaultType}
            >
              {Object.values(WorkType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-600">
              Tip: para Journal usa el atajo{" "}
              <span className="text-zinc-400">/admin/works/new?type=JOURNAL</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Estado</label>
            <select
              name="status"
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              defaultValue={defaultStatus}
            >
              {Object.values(WorkStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Home</label>
            <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-black px-3 py-2">
              <input
                type="checkbox"
                name="featured"
                className="h-4 w-4 accent-red-500"
                disabled={!featuredTag?.id}
              />
              <span className="text-sm text-zinc-200">
                Featured (sale en Home)
              </span>
              {!featuredTag?.id ? (
                <span className="ml-auto text-xs text-zinc-500">
                  falta tag <span className="text-zinc-300">home-featured</span>
                </span>
              ) : null}
            </label>
            <div className="text-xs text-zinc-500">
              Marca esto y se añadirá el tag{" "}
              <span className="text-zinc-300">home-featured</span>.
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm text-zinc-300">Tags (multi)</label>
            <select
              name="tagIds"
              multiple
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm h-28"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-500">Ctrl/Cmd para varias.</div>
            {isJournal ? (
              <div className="text-xs text-zinc-600">
                Nota: si Type es JOURNAL, se añadirá automáticamente el tag{" "}
                <span className="text-zinc-400">journal</span>.
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Excerpt</label>
            <textarea
              name="excerpt"
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              rows={4}
              placeholder="1–2 frases."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Contenido</label>
          <textarea
            name="content"
            className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
            rows={10}
            placeholder={
              isJournal
                ? "Escribe como si fuera una nota editorial. Párrafos. Ritmo. Sin postureo."
                : "Texto largo / notas / proceso (opcional)."
            }
          />
        </div>

        <WorkMediaFields coverRequired={!isJournal} defaultCollapsed={isJournal} />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Crear Work
          </button>
        </div>
      </form>
    </section>
  );
}
