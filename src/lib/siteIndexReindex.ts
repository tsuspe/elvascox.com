// src/lib/siteIndexReindex.ts
import { SITE_PAGES } from "@/lib/sitePages";
import { prisma } from "@/lib/prisma";

function cleanText(s: string | null | undefined, maxLen: number) {
  const txt = String(s ?? "").replace(/\s+/g, " ").trim();
  if (!txt) return null;
  return txt.length > maxLen ? txt.slice(0, maxLen).trim() : txt;
}

function uniqClean(arr: string[], limit = 40) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const v = String(x ?? "").trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

function normalizeKeywords(kw?: string[] | null) {
  const base = Array.isArray(kw) ? kw : [];
  return uniqClean(base, 40);
}

function normalizeLabels(labels?: string[] | null) {
  const base = Array.isArray(labels) ? labels : [];
  return uniqClean(base, 40);
}

async function buildIndexPayload() {
  const staticPages = SITE_PAGES.map((p: any) => ({
    href: String(p.href),
    title: String(p.title ?? "Page"),
    section: p.section ? String(p.section) : null,
    labels: normalizeLabels(p.labels ?? []),
    description: cleanText(p.description, 220),
    keywords: normalizeKeywords(p.keywords ?? []),
    excerpt: cleanText(p.excerpt, 260),
    content: cleanText(p.content, 4000),
    source: "page",
    workId: null,
  }));

  const works = await prisma.work.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      seoTitle: true,
      seoDescription: true,
      type: true,
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });

  const workPages = works.map((w: any) => {
    const tagNames = (w.tags ?? [])
      .map((t: any) => t.tag?.name)
      .filter(Boolean) as string[];
    const tagSlugs = (w.tags ?? [])
      .map((t: any) => t.tag?.slug)
      .filter(Boolean) as string[];

    const keywords = uniqClean([...tagNames, ...tagSlugs], 40);
    const labels = uniqClean(
      [
        String(w.type ?? "").toLowerCase(),
        ...tagSlugs.map((t: string) => String(t).toLowerCase()),
      ].filter(Boolean),
      40
    );

    const title = cleanText(w.seoTitle ?? w.title, 90) ?? "Work";
    const description = cleanText(w.seoDescription ?? w.excerpt, 220);
    const excerpt = cleanText(w.excerpt, 260) ?? cleanText(w.content, 260);
    const content = cleanText(w.content, 4000);

    return {
      href: `/work/${w.slug}`,
      title,
      section: "work",
      labels,
      description,
      keywords,
      excerpt,
      content,
      source: "work",
      workId: w.id,
    };
  });

  return [...staticPages, ...workPages];
}

export async function reindexSitePages(): Promise<number> {
  const items = await buildIndexPayload();
  const hrefs = items.map((i) => i.href);

  await prisma.$transaction(async (tx) => {
    await tx.sitePageIndex.deleteMany({
      where: {
        source: { in: ["page", "work"] },
        href: { notIn: hrefs },
      },
    });

    for (const p of items) {
      await tx.sitePageIndex.upsert({
        where: { href: p.href },
        update: {
          title: p.title,
          section: p.section,
          labels: p.labels ?? [],
          description: p.description,
          keywords: p.keywords ?? [],
          excerpt: p.excerpt,
          content: p.content,
          source: p.source,
          workId: p.workId,
        },
        create: {
          href: p.href,
          title: p.title,
          section: p.section,
          labels: p.labels ?? [],
          description: p.description,
          keywords: p.keywords ?? [],
          excerpt: p.excerpt,
          content: p.content,
          source: p.source,
          workId: p.workId,
        },
      });
    }
  });

  return items.length;
}
