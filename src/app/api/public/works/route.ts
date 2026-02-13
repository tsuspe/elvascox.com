//src/app/api/public/works/route.ts
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type"); // TATTOO | MUSIC | ...
  const tag = searchParams.get("tag"); // tag slug
  const q = searchParams.get("q"); // search query
  const page = clamp(Number(searchParams.get("page") ?? "1") || 1, 1, 10_000);
  const pageSize = clamp(Number(searchParams.get("pageSize") ?? "12") || 12, 1, 50);

  const where: any = { status: "PUBLISHED" };

  if (type) where.type = type;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
    ];
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  const [total, items] = await Promise.all([
    prisma.work.count({ where }),
    prisma.work.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        type: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        media: {
          orderBy: { order: "asc" },
          take: 6,
          select: { kind: true, url: true, alt: true, width: true, height: true, isCover: true, order: true },
        },
        tags: { select: { tag: { select: { slug: true, name: true } } } },
        linksFrom: { select: { to: { select: { slug: true, title: true } }, label: true } },
        linksTo: { select: { from: { select: { slug: true, title: true } }, label: true } },
      },
    }),
  ]);

  const data = items.map((w) => ({
    ...w,
    url: siteUrl(`/work/${w.slug}`),
    tags: w.tags.map((t) => t.tag),
    linksFrom: w.linksFrom.map((l) => ({ ...l, to: { ...l.to, url: siteUrl(`/work/${l.to.slug}`) } })),
    linksTo: w.linksTo.map((l) => ({ ...l, from: { ...l.from, url: siteUrl(`/work/${l.from.slug}`) } })),
  }));

  return Response.json(
    {
      ok: true,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      data,
    },
    {
      headers: {
        "cache-control": "public, max-age=60",
      },
    }
  );
}
