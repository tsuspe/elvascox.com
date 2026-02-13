// src/app/sitemap.xml/route.ts
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 300;

function xml(urls: string[]) {
  const body = urls.map((u) => `<url><loc>${u}</loc></url>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export async function GET() {
  const staticUrls = [
    siteUrl("/"),
    siteUrl("/work"),
    siteUrl("/tattoo"),
    siteUrl("/musica"),
    siteUrl("/film"),
    siteUrl("/arte"),
    siteUrl("/dev"),
    siteUrl("/journal"),
    siteUrl("/bio"),
    siteUrl("/contacto"),
    siteUrl("/search"),
  ];

  // ✅ En Vercel build suele no existir (o no poder abrirse) SQLite
  if (!process.env.DATABASE_URL) {
    return new Response(xml(staticUrls), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  try {
    // ✅ Import dinámico: evita inicialización de Prisma fuera del try/catch
    const { prisma } = await import("@/lib/prisma");

    const works = await prisma.work.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5000,
    });

    const workUrls = works.map((w) => siteUrl(`/work/${w.slug}`));

    return new Response(xml([...staticUrls, ...workUrls]), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (err) {
    console.error("[sitemap.xml] prisma failed → static fallback", err);

    return new Response(xml(staticUrls), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}
