// src/app/api/public/tags/route.ts
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const tags = await prisma.tag.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      slug: true,
      name: true,
      _count: { select: { works: true } },
    },
  });

  return Response.json(
    {
      ok: true,
      data: tags.map((t) => ({ slug: t.slug, name: t.name, count: t._count.works })),
    },
    { headers: { "cache-control": "public, max-age=300" } }
  );
}
