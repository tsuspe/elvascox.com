// src/app/api/public/meta/route.ts

import { siteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      ok: true,
      apiVersion: "1.0.0",
      updatedAt: new Date().toISOString(),

      site: siteUrl("/"),
      endpoints: {
        meta: siteUrl("/api/public/meta"),
        works: siteUrl("/api/public/works"),
        work: siteUrl("/api/public/works/{slug}"),
        search: siteUrl("/api/public/search?q={query}"),
        tags: siteUrl("/api/public/tags"),
        llms: siteUrl("/llms.txt"),
        sitemap: siteUrl("/sitemap.xml"),
        robots: siteUrl("/robots.txt"),
      },
      rules: {
        publicVisibility: "Only Work.status === PUBLISHED is public",
        paging: { page: "1-based", pageSizeMax: 50 },
      },
      workTypes: ["TATTOO", "MUSIC", "FILM", "ART", "DEV", "JOURNAL"],
    },
    { headers: { "cache-control": "public, max-age=300" } }
  );
}
