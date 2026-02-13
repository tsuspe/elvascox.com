// src/app/api/public/works/[slug]/route.ts
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return Response.json({ ok: false, error: "missing_slug" }, { status: 400 });
  }

  const w = await prisma.work.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      type: true,
      status: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      media: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          kind: true,
          url: true,
          alt: true,
          width: true,
          height: true,
          isCover: true,
          order: true,
          createdAt: true,
        },
      },
      tags: {
        select: {
          tag: { select: { slug: true, name: true } },
        },
      },
      linksFrom: {
        select: {
          id: true,
          label: true,
          to: { select: { slug: true, title: true, type: true } },
        },
      },
      linksTo: {
        select: {
          id: true,
          label: true,
          from: { select: { slug: true, title: true, type: true } },
        },
      },
    },
  });

  if (!w) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  if (w.status !== "PUBLISHED") {
    return Response.json({ ok: false, error: "not_published" }, { status: 404 });
  }

  return Response.json(
    {
      ok: true,
      data: {
        ...w,
        url: siteUrl(`/work/${w.slug}`),
        tags: w.tags.map((t) => t.tag),
      },
    },
    { headers: { "cache-control": "public, max-age=60" } }
  );
}
