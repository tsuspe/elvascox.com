//src/app/api/public/search/route.ts

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qRaw = (searchParams.get("q") ?? "").trim();
  const q = qRaw; // en SQLite quitamos mode:insensitive

  const page = clamp(Number(searchParams.get("page") ?? "1") || 1, 1, 10_000);
  const pageSize = clamp(Number(searchParams.get("pageSize") ?? "12") || 12, 1, 50);

  if (!q) {
    return Response.json({
      ok: true,
      q: "",
      page,
      pageSize,
      total: 0,
      totalPages: 1,
      data: [],
    });
  }

  // SQLite: sin `mode: "insensitive"`
  const where: any = {
    status: "PUBLISHED",
    OR: [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
      { tags: { some: { tag: { name: { contains: q } } } } },
    ],
  };

  const [total, items] = await Promise.all([
    prisma.work.count({ where }),
    prisma.work.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        slug: true,
        type: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true,
        media: {
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true, alt: true, isCover: true, order: true, kind: true, width: true, height: true },
        },
        tags: { select: { tag: { select: { slug: true, name: true } } } },
      },
    }),
  ]);

  return Response.json(
    {
      ok: true,
      q,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      data: items.map((w) => ({
        ...w,
        url: siteUrl(`/work/${w.slug}`),
        tags: w.tags.map((t) => t.tag),
      })),
    },
    { headers: { "cache-control": "public, max-age=60" } }
  );
}
