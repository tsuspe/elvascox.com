// src/app/admin/works/[id]/page.tsx

import WorkMediaFields from "@/components/admin/WorkMediaFields";
import { prisma } from "@/lib/prisma";
import { reindexSitePages } from "@/lib/siteIndexReindex";
import { WorkStatus, WorkType } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

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

async function updateWork(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const type = String(formData.get("type") ?? "ART") as WorkType;
  const status = String(formData.get("status") ?? "PUBLISHED") as WorkStatus;

  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();

  // tags multi-select
  const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);

  // ✅ featured checkbox → tag "home-featured"
  const featuredChecked =
    String(formData.get("featured") ?? "").toLowerCase() === "on";
  const featuredTagId = String(formData.get("featuredTagId") ?? "").trim();

  const galleryUrlsRaw = parseLines(String(formData.get("galleryUrls") ?? ""));
  const galleryUrls = uniqueLines(galleryUrlsRaw).filter((u) => u !== coverUrl);

  if (!id) throw new Error("id requerido");
  if (!title) throw new Error("title requerido");
  const slug = normalizeSlug(slugRaw || title);
  if (!slug) throw new Error("slug inválido");
  if (!coverUrl) throw new Error("coverUrl requerido");

  // leemos el estado actual para no resetear publishedAt en cada edit
  const existing = await prisma.work.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!existing) notFound();

  const nextPublishedAt =
    status === "PUBLISHED"
      ? existing.status === "PUBLISHED"
        ? existing.publishedAt ?? new Date()
        : new Date()
      : null;

  const wasPublished = existing.status === "PUBLISHED";
  const nowPublished = status === "PUBLISHED";
  const shouldReindex = wasPublished || nowPublished;

  // ✅ aplicar featured a los tagIds (sin pisar el resto)
  let finalTagIds = [...tagIds];
  if (featuredTagId) {
    if (featuredChecked) {
      if (!finalTagIds.includes(featuredTagId)) finalTagIds.push(featuredTagId);
    } else {
      finalTagIds = finalTagIds.filter((tid) => tid !== featuredTagId);
    }
  }

    // ✅ Si es JOURNAL, aseguramos tag slug "journal"
  if (type === "JOURNAL") {
    const journalTag = await prisma.tag.upsert({
      where: { slug: "journal" },
      update: {},
      create: { slug: "journal", name: "Journal" },
      select: { id: true },
    });
    if (!finalTagIds.includes(journalTag.id)) finalTagIds.push(journalTag.id);
  }


  // Media a insertar (sin workId aquí, se lo pondremos al hacer tx.media.createMany)
  const mediaToCreate = [
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
      alt: null as string | null,
      width: 1400,
      height: 900,
      order: idx + 1,
      isCover: false,
    })),
  ];

  await prisma.$transaction(async (tx) => {
    // reset rels
    await tx.workTag.deleteMany({ where: { workId: id } });
    await tx.media.deleteMany({ where: { workId: id } });

    // update del work SIN nested media (para evitar el error de workId)
    await tx.work.update({
      where: { id },
      data: {
        slug,
        title,
        excerpt: excerpt || null,
        content: content || null,
        type,
        status,
        publishedAt: nextPublishedAt,
        tags: finalTagIds.length
          ? { create: finalTagIds.map((tid) => ({ tagId: tid })) }
          : undefined,
      },
    });

    // insertar media aparte (aquí sí workId)
    if (mediaToCreate.length) {
      await tx.media.createMany({
        data: mediaToCreate.map((m) => ({
          workId: id,
          kind: m.kind,
          url: m.url,
          alt: m.alt ?? null,
          width: m.width ?? 1400,
          height: m.height ?? 900,
          order: m.order ?? 0,
          isCover: !!m.isCover,
        })),
      });
    }
  });

  let reindexParam = "";
  if (shouldReindex) {
    try {
      await reindexSitePages();
      reindexParam = `&reindex=ok&pub=${nowPublished && !wasPublished ? "1" : "0"}`;
    } catch (err) {
      console.error("[reindex] failed on update", err);
      reindexParam = `&reindex=err&pub=${nowPublished && !wasPublished ? "1" : "0"}&reindex_msg=${errToMsg(err)}`;
    }
  }

  redirect(`/admin/works/${id}?ok=updated${reindexParam}`);
}

async function deleteWork(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id requerido");

  await prisma.work.delete({ where: { id } });
  redirect("/admin/works?ok=deleted");
}

function pickCover(
  media:
    | Array<{ isCover?: boolean; url: string; alt?: string | null }>
    | undefined
) {
  if (!media?.length) return null;
  return (media.find((m) => m.isCover) ?? media[0]) ?? null;
}

export default async function EditWorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ ok?: string; reindex?: string; pub?: string; reindex_msg?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const ok = String(sp.ok ?? "");
  const reindex = String(sp.reindex ?? "");
  const pub = String(sp.pub ?? "");
  const reindexMsg = String(sp.reindex_msg ?? "");

  const [work, tags, featuredTag] = await Promise.all([
    prisma.work.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        media: { orderBy: { order: "asc" } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.tag.findUnique({
      where: { slug: "home-featured" },
      select: { id: true },
    }),
  ]);

  if (!work) notFound();

  const selectedTagIds = new Set(work.tags.map((t) => t.tagId));

  // ✅ estado actual de featured (por tag)
  const isFeatured = featuredTag?.id
    ? selectedTagIds.has(featuredTag.id)
    : false;

  const cover = pickCover(work.media as any);
  const gallery = work.media
    .filter((m) => !m.isCover)
    .sort((a, b) => a.order - b.order)
    .map((m) => m.url)
    .join("\n");

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500">Edit Work</div>
          <h1 className="text-xl font-semibold">{work.title}</h1>
          <div className="text-sm text-zinc-500">
            <Link
              href={`/work/${work.slug}`}
              className="hover:text-zinc-300 transition"
            >
              ver público →
            </Link>
          </div>
        </div>

        <Link
          href="/admin/works"
          className="text-sm text-zinc-300 hover:text-white transition"
        >
          ← volver
        </Link>
      </div>

      {ok && reindex === "ok" ? (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
          {pub === "1"
            ? "Work publicado y páginas reindexadas. Todo al día."
            : "Work actualizado y páginas reindexadas."}
        </div>
      ) : null}
      {ok && reindex === "err" ? (
        <div className="rounded-xl border border-red-800 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          {pub === "1"
            ? "Work publicado, pero falló el reindex. Reintenta desde /admin/works."
            : "Work actualizado, pero falló el reindex. Reintenta desde /admin/works."}
          {reindexMsg ? (
            <div className="mt-1 text-xs text-red-300">
              {decodeURIComponent(reindexMsg)}
            </div>
          ) : null}
        </div>
      ) : null}

      <form action={updateWork} className="space-y-5">
        <input type="hidden" name="id" value={work.id} />
        {/* ✅ id del tag featured para el server action */}
        <input
          type="hidden"
          name="featuredTagId"
          value={featuredTag?.id ?? ""}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Título</label>
            <input
              name="title"
              defaultValue={work.title}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Slug</label>
            <input
              name="slug"
              defaultValue={work.slug}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Tipo</label>
            <select
              name="type"
              defaultValue={work.type}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
            >
              {Object.values(WorkType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Estado</label>
            <select
              name="status"
              defaultValue={work.status}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
            >
              {Object.values(WorkStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ FEATURED checkbox */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Home</label>
            <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-black px-3 py-2">
              <input
                type="checkbox"
                name="featured"
                className="h-4 w-4 accent-red-500"
                defaultChecked={isFeatured}
                disabled={!featuredTag?.id}
              />
              <span className="text-sm text-zinc-200">
                Featured (sale en Home)
              </span>
              {!featuredTag?.id ? (
                <span className="ml-auto text-xs text-zinc-500">
                  falta tag{" "}
                  <span className="text-zinc-300">home-featured</span>
                </span>
              ) : null}
            </label>
            <div className="text-xs text-zinc-500">
              Marca esto y se añadirá/eliminará el tag{" "}
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
              defaultValue={[...selectedTagIds]}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm h-28"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-500">Ctrl/Cmd para varias.</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Excerpt</label>
            <textarea
              name="excerpt"
              defaultValue={work.excerpt ?? ""}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-zinc-300">Contenido</label>
          <textarea
            name="content"
            defaultValue={work.content ?? ""}
            className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
            rows={8}
          />
        </div>

        <WorkMediaFields
          defaultCoverUrl={cover?.url ?? ""}
          defaultCoverAlt={cover?.alt ?? ""}
          defaultGalleryUrls={gallery}
          coverRequired={work.type !== "JOURNAL"}
          defaultCollapsed={work.type === "JOURNAL"}
        />


        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Guardar cambios
          </button>

          <DeleteButton
            formAction={deleteWork}
            className="rounded-lg border border-red-900/60 px-4 py-2 text-sm text-red-300 hover:border-red-500 transition"
          >
            Borrar
          </DeleteButton>
        </div>
      </form>
    </section>
  );
}
