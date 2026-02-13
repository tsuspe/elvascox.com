// src/app/sitemap.ts
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // 1h

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const basePages = [
    "",
    "/work",
    "/tattoo",
    "/musica",
    "/film",
    "/arte",
    "/dev",
    "/journal",
    "/bio",
    "/contacto",
  ];

  const works = await prisma.work.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });

  const now = new Date();

  const baseFreq: ChangeFreq = "weekly";
  const workFreq: ChangeFreq = "monthly";

  return [
    ...basePages.map((p) => ({
      url: siteUrl(p || "/"),
      lastModified: now,
      changeFrequency: baseFreq,
      priority: p === "" ? 1 : 0.7,
    })),
    ...works.map((w) => ({
      url: siteUrl(`/work/${w.slug}`),
      lastModified: w.updatedAt ?? w.publishedAt ?? now,
      changeFrequency: workFreq,
      priority: 0.6,
    })),
  ];
}
