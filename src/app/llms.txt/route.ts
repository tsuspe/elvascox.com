//src/app/llms.txt/route.ts
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

export async function GET() {
  const recent = await prisma.work.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [
      { publishedAt: "desc" },
      { updatedAt: "desc" },
      { createdAt: "desc" },
    ],
    take: 30,
    select: {
      slug: true,
      title: true,
      type: true,
      excerpt: true,
    },
  });

  const lines: string[] = [];

  lines.push("# elvasco.x — llms.txt");
  lines.push("");
  lines.push("Sitio: " + siteUrl("/"));
  lines.push("Sitemap: " + siteUrl("/sitemap.xml"));
  lines.push("Robots: " + siteUrl("/robots.txt"));
  lines.push("");

  lines.push("API pública (read-only):");
  lines.push("- " + siteUrl("/api/public/meta"));
  lines.push("- " + siteUrl("/api/public/works"));
  lines.push("- " + siteUrl("/api/public/works/{slug}"));
  lines.push("- " + siteUrl("/api/public/search?q=..."));
  lines.push("- " + siteUrl("/api/public/tags"));
  lines.push("");

  lines.push("Reglas:");
  lines.push("- Solo contenido con status=PUBLISHED es público.");
  lines.push("- La API es solo lectura.");
  lines.push("- Paginación 1-based.");
  lines.push("");

  lines.push("Rutas principales:");
  lines.push("- " + siteUrl("/work"));
  lines.push("- " + siteUrl("/tattoo"));
  lines.push("- " + siteUrl("/musica"));
  lines.push("- " + siteUrl("/film"));
  lines.push("- " + siteUrl("/arte"));
  lines.push("- " + siteUrl("/dev"));
  lines.push("- " + siteUrl("/journal"));
  lines.push("- " + siteUrl("/bio"));
  lines.push("");

  lines.push("Piezas recientes (PUBLISHED):");

  for (const w of recent) {
    const url = siteUrl(`/work/${w.slug}`);
    const desc = (w.excerpt ?? "")
      .replace(/\s+/g, " ")
      .slice(0, 140);

    lines.push(
      `- [${w.type}] ${w.title} — ${url}${desc ? ` — ${desc}` : ""}`
    );
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
