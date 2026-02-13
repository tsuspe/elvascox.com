// src/lib/siteIndex.ts
import { prisma } from "@/lib/prisma";
import { SITE_PAGES } from "@/lib/sitePages";

type PageHit = {
  href: string;
  title: string;
  description?: string | null;
  excerpt?: string | null;
  keywords?: string[] | null;
  content?: string | null;
};

function normalizeTxt(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function scorePage(p: any, qRaw: string) {
  const q = normalizeTxt(qRaw);
  if (!q) return 0;

  const content = normalizeTxt(p.content ?? "");
  const title = normalizeTxt(p.title ?? "");
  const desc = normalizeTxt(p.description ?? "");
  const excerpt = normalizeTxt(p.excerpt ?? "");
  const href = normalizeTxt(p.href ?? "");
  const keywords = Array.isArray(p.keywords) ? (p.keywords as string[]) : [];

  let score = 0;

  if (title === q) score += 50;
  if (href.endsWith(`/${q}`) || href.includes(`/${q}/`)) score += 35;

  if (title.includes(q)) score += 25;
  if (keywords.some((k) => normalizeTxt(k).includes(q))) score += 18;
  if (desc.includes(q)) score += 15;
  if (excerpt.includes(q)) score += 12;
  if (content.includes(q)) score += 10;

  if (q.length <= 10 && keywords.some((k) => normalizeTxt(k) === q)) score += 12;

  return score;
}

function toHit(p: any): PageHit {
  return {
    href: String(p.href),
    title: String(p.title ?? ""),
    description: p.description ? String(p.description) : null,
    excerpt: p.excerpt ? String(p.excerpt) : null,
    keywords: Array.isArray(p.keywords) ? (p.keywords as string[]) : null,
    content: p.content ? String(p.content).slice(0, 1200) : null,
  };
}

async function fetchAllPagesFromDb(): Promise<any[]> {
  try {
    return await prisma.sitePageIndex.findMany({
      select: {
        href: true,
        title: true,
        description: true,
        excerpt: true,
        keywords: true,
        content: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getSitePageByHref(href: string): Promise<PageHit | null> {
  const clean = String(href ?? "").trim();
  if (!clean) return null;

  try {
    const db = await prisma.sitePageIndex.findUnique({
      where: { href: clean },
      select: {
        href: true,
        title: true,
        description: true,
        excerpt: true,
        keywords: true,
        content: true,
      },
    });
    if (db) return toHit(db);
  } catch {
    // fall back to static list
  }

  const fallback = SITE_PAGES.find((p: any) => String(p.href) === clean);
  return fallback ? toHit(fallback) : null;
}

export async function searchSitePages(query: string, limit = 6): Promise<PageHit[]> {
  const q = normalizeTxt(query);
  if (!q || q.length < 2) return [];

  let pages = await fetchAllPagesFromDb();
  if (!pages.length) pages = SITE_PAGES as any[];

  const scored = pages
    .map((p: any) => {
      const score = scorePage(p, query);
      if (score <= 0) return null;
      return { score, hit: toHit(p) };
    })
    .filter(Boolean) as Array<{ score: number; hit: PageHit }>;

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.hit);
}
