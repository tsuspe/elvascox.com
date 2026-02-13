import { prisma } from "@/lib/prisma";
import { reindexSitePages } from "@/lib/siteIndexReindex";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
};

function slugifyTag(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)+/g, "");
}

async function saveWork(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/journal?err=id_invalido");

  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  if (!slug || !title || !content) redirect(`/admin/journal/${id}?err=missing_fields`);

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const existing = await prisma.work.findUnique({
    where: { id },
    select: { status: true, type: true },
  });
  if (!existing) redirect("/admin/journal?err=not_found");

  const tagIds: string[] = [];
  for (const name of tags) {
    const slugTag = slugifyTag(name);
    if (!slugTag) continue;
    const tag = await prisma.tag.upsert({
      where: { slug: slugTag },
      update: { name },
      create: { slug: slugTag, name },
      select: { id: true },
    });
    tagIds.push(tag.id);
  }

  await prisma.$transaction(async (tx) => {
    await tx.workTag.deleteMany({ where: { workId: id } });

    await tx.work.update({
      where: { id },
      data: {
        slug,
        title,
        excerpt: excerpt || null,
        content,
        type: "JOURNAL",
      },
    });

    if (tagIds.length) {
      await tx.workTag.createMany({
        data: tagIds.map((tagId) => ({ workId: id, tagId })),
      });
    }
  });

  if (existing.status === "PUBLISHED") {
    try {
      await reindexSitePages();
    } catch {
      redirect(`/admin/journal/${id}?err=reindex_failed`);
    }
  }

  redirect(`/admin/journal/${id}?ok=saved`);
}

async function togglePublishWork(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/journal?err=id_invalido");

  const row = await prisma.work.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!row) redirect("/admin/journal?err=not_found");

  const nextStatus = row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.work.update({
    where: { id },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === "PUBLISHED" ? row.publishedAt ?? new Date() : null,
    },
  });

  try {
    await reindexSitePages();
  } catch {
    redirect(`/admin/journal/${id}?err=reindex_failed`);
  }

  redirect(`/admin/journal/${id}?ok=${nextStatus.toLowerCase()}`);
}

async function deleteWork(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/journal?err=id_invalido");

  await prisma.work.delete({ where: { id } });
  redirect("/admin/journal?ok=deleted");
}

export default async function AdminEditJournalPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { ok, err } = await searchParams;

  const work = await prisma.work.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      status: true,
      type: true,
      publishedAt: true,
      updatedAt: true,
      tags: { include: { tag: true } },
    },
  });

  if (!work) notFound();
  if (work.type !== "JOURNAL") redirect("/admin/journal?err=not_journal");

  const tags = (work.tags ?? []).map((t) => t.tag.name).join(", ");

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Editar Journal</h1>
          <p className="text-sm text-zinc-400">
            Estado:{" "}
            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs">
              {work.status}
            </span>{" "}
            · Última edición: {new Date(work.updatedAt).toLocaleString("es-ES")}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/journal"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 transition"
          >
            Volver
          </Link>

          {work.status === "PUBLISHED" ? (
            <Link
              href={`/journal/${work.slug}`}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 transition"
            >
              Ver en Journal
            </Link>
          ) : null}
        </div>
      </div>

      {ok ? (
        <div className="rounded-lg border border-zinc-700 bg-black p-3 text-sm text-zinc-200">
          OK: {ok}
        </div>
      ) : null}
      {err ? (
        <div className="rounded-lg border border-red-700 bg-black p-3 text-sm text-red-300">
          Error: {err}
        </div>
      ) : null}

      {/* Form */}
      <form action={saveWork} className="space-y-4">
        <input type="hidden" name="id" value={work.id} />

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Slug</label>
          <input
            name="slug"
            defaultValue={work.slug}
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Título</label>
          <input
            name="title"
            defaultValue={work.title}
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Excerpt (opcional)</label>
          <input
            name="excerpt"
            defaultValue={work.excerpt ?? ""}
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Tags (coma separada)</label>
          <input
            name="tags"
            defaultValue={tags}
            placeholder="filosofía, vida, tattoo, dev"
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-zinc-300">Contenido</label>
          <textarea
            name="content"
            defaultValue={work.content ?? ""}
            rows={12}
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
          />
        </div>

        <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition">
          Guardar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <form action={togglePublishWork}>
          <input type="hidden" name="id" value={work.id} />
          <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition">
            {work.status === "PUBLISHED" ? "Pasar a draft" : "Publicar"}
          </button>
        </form>

        <form action={deleteWork}>
          <input type="hidden" name="id" value={work.id} />
          <DeleteButton
            formAction={deleteWork}
            className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-300 hover:border-red-500 transition"
            confirmText="¿Borrar este Journal? (acción irreversible)"
          >
            Borrar
          </DeleteButton>
        </form>

      </div>

      {work.status === "PUBLISHED" && work.publishedAt ? (
        <p className="text-xs text-zinc-500">
          Publicado: {new Date(work.publishedAt).toLocaleString("es-ES")}
        </p>
      ) : null}
    </section>
  );
}
