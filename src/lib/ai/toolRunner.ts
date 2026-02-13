// src/lib/ai/toolRunner.ts
import { prisma } from "@/lib/prisma";
import { getSitePageByHref, searchSitePages } from "@/lib/siteIndex";
import { siteUrl } from "@/lib/siteUrl";
import type { WorkType } from "@prisma/client";

type PageHit = {
  href: string;
  title: string;
  description?: string | null;
  excerpt?: string | null;
  keywords?: string[] | null;
  content?: string | null;
};

type ToolResult =
  | { tool: "searchAll"; data: any }
  | { tool: "searchPages"; data: any }
  | { tool: "getPageByPath"; data: any }
  | { tool: "searchWorks"; data: any }
  | { tool: "getWorkBySlug"; data: any }
  | { tool: "listLatest"; data: any }
  | { tool: "listByType"; data: any }
  | { tool: "listTags"; data: any }
  | { tool: "none"; data: null };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toType(raw?: string): WorkType | null {
  const t = String(raw ?? "").toUpperCase();
  const allowed: WorkType[] = ["TATTOO", "MUSIC", "FILM", "ART", "DEV", "JOURNAL"];
  return allowed.includes(t as WorkType) ? (t as WorkType) : null;
}

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

async function searchPagesLocal(query: string, limit = 6): Promise<PageHit[]> {
  return await searchSitePages(query, limit);
}

async function getPageByPathLocal(pathname: string): Promise<PageHit | null> {
  return await getSitePageByHref(pathname);
}

function buildWorkCard(w: any) {
  const cover =
    (w.media ?? []).find((m: any) => m.isCover) ?? (w.media ?? [])[0] ?? null;

  const href = `/work/${w.slug}`;

  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    excerpt: w.excerpt ?? null,
    type: w.type,
    publishedAt: w.publishedAt ?? null,
    href,
    canonical: siteUrl(href),
    cover: cover
      ? {
          url: cover.url,
          alt: cover.alt ?? null,
          width: cover.width ?? null,
          height: cover.height ?? null,
        }
      : null,
    tags: (w.tags ?? [])
      .map((t: any) => t.tag?.name)
      .filter(Boolean)
      .slice(0, 8),
    tagSlugs: (w.tags ?? [])
      .map((t: any) => t.tag?.slug)
      .filter(Boolean)
      .slice(0, 8),
  };
}

async function searchWorksDb(query: string, page: any, typeHint?: WorkType | null) {
  const take = clamp(Number(page?.take ?? 10), 5, 20);

  // ✅ normalizamos la query (case-insensitive + sin tildes)
  const q = normalizeTxt(query);
  if (!q || q.length < 2) return [];

  // ✅ traemos más para poder filtrar bien luego
  const preTake = clamp(take * 5, 25, 100);

  const items = await prisma.work.findMany({
    where: {
      status: "PUBLISHED",
      ...(typeHint ? { type: typeHint } : {}),
      // ⚠️ aquí NO usamos mode (tu Prisma no lo soporta)
      // usamos contains normal (rápido) + luego filtramos fino abajo
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { content: { contains: query } },
        { tags: { some: { tag: { name: { contains: query } } } } },
        { tags: { some: { tag: { slug: { contains: query } } } } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: preTake,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true, // 👈 necesario para filtrar bien
      type: true,
      publishedAt: true,
      tags: { include: { tag: true } },
      media: { orderBy: { order: "asc" }, take: 3 },
      createdAt: true, // (opcional, pero útil si lo usas en cards)
    },
  });

  // ✅ filtro “insensitive” real (minúsculas + sin tildes)
  const filtered = items.filter((w: any) => {
    const title = normalizeTxt(w.title ?? "");
    const excerpt = normalizeTxt(w.excerpt ?? "");
    const content = normalizeTxt(w.content ?? "");
    const tagNames = (w.tags ?? []).map((t: any) => normalizeTxt(t.tag?.name ?? ""));
    const tagSlugs = (w.tags ?? []).map((t: any) => normalizeTxt(t.tag?.slug ?? ""));

    return (
      title.includes(q) ||
      excerpt.includes(q) ||
      content.includes(q) ||
      tagNames.some((x: string) => x.includes(q)) ||
      tagSlugs.some((x: string) => x.includes(q))
    );
  });

  // ✅ devolvemos SOLO lo que el caller pidió
  return filtered.slice(0, take).map(buildWorkCard);
}


function isExplicitPagesOnly(text: string) {
  return /\b(solo|s[oó]lo)\b.*\b(p[aá]gina|pages|web)\b|\b(en la p[aá]gina|en pages|web del sitio)\b/i.test(
    text
  );
}

function isExplicitWorksOnly(text: string) {
  return /\b(solo|s[oó]lo)\b.*\b(archivo|works)\b|\b(en el archivo|dentro del archivo|en works|en el work)\b/i.test(
    text
  );
}

function extractQueryFromText(text: string) {
  const t = String(text ?? "").trim();

  const qMatch = t.match(/\b(busca|buscar|search|encuentra)\b\s+(.+)$/i);
  if (qMatch?.[2]) return qMatch[2].trim().slice(0, 80);

  const qe = t.match(/\bqu[eé]\s+es\b\s+(.+)$/i);
  if (qe?.[1]) return qe[1].trim().slice(0, 80);

  return t.slice(0, 80);
}

function cleanPathname(pathname: string) {
  // por si llega con query/hash pegado
  return String(pathname ?? "").split("?")[0].split("#")[0].trim();
}

export async function runToolIfNeeded(args: {
  userText: string;
  page?: any;
}): Promise<ToolResult> {
  const text = String(args.userText ?? "").trim();
  const page = args.page ?? {};
  const pathname = cleanPathname(String(page.pathname ?? ""));

  // 0) Si estamos en una página del site (no /work) → getPageByPath
  if (pathname && !pathname.startsWith("/work")) {
    const p = await getPageByPathLocal(pathname);
    if (p) return { tool: "getPageByPath", data: { ok: true, page: p } };
  }

  // 1) Si estamos en /work/[slug] → getWorkBySlug
  const m = pathname.match(/^\/work\/([^/?#]+)/);
  if (m?.[1]) {
    const slug = m[1];
    const work = await prisma.work.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        type: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        tags: { include: { tag: true } },
        media: { orderBy: { order: "asc" }, take: 6 },
        linksFrom: { include: { to: true } },
        linksTo: { include: { from: true } },
      },
    });

    if (work?.status === "PUBLISHED") {
      return {
        tool: "getWorkBySlug",
        data: {
          ok: true,
          work: {
            ...buildWorkCard(work),
            content: (work.content ?? "").slice(0, 3000) || null,
            linksFrom: (work.linksFrom ?? []).slice(0, 6).map((l: any) => ({
              label: l.label ?? null,
              to: { title: l.to.title, slug: l.to.slug, href: `/work/${l.to.slug}` },
            })),
            linksTo: (work.linksTo ?? []).slice(0, 6).map((l: any) => ({
              label: l.label ?? null,
              from: { title: l.from.title, slug: l.from.slug, href: `/work/${l.from.slug}` },
            })),
          },
        },
      };
    }
  }

  // 2) Intenciones
  const wantsSearch =
    /\b(busca|buscar|search|encuentra|quiero ver|mu[eé]strame|dame)\b/i.test(text);

  const wantsLatest =
    /\b([uú]ltimos|ultimos|latest|recientes|nuevo|nuevos)\b/i.test(text);

  const userTypeHint = toType(text.match(/\b(tattoo|music|film|art|dev|journal)\b/i)?.[1]);
  const typeHint = userTypeHint;

  // 3) Latest (solo works)
  if (wantsLatest) {
    const take = 8;
    const where: any = { status: "PUBLISHED" };
    if (typeHint) where.type = typeHint;

    const items = await prisma.work.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        type: true,
        publishedAt: true,
        tags: { include: { tag: true } },
        media: { orderBy: { order: "asc" }, take: 3 },
      },
    });

    return {
      tool: typeHint ? "listByType" : "listLatest",
      data: { ok: true, items: items.map(buildWorkCard) },
    };
  }

  // 4) Query “semántica”
  const query = extractQueryFromText(text);

  // 5) BÚSQUEDA GLOBAL
  if (wantsSearch && query.length >= 2) {
    const pagesOnly = isExplicitPagesOnly(text);
    const worksOnly = isExplicitWorksOnly(text);

    const pages = pagesOnly || !worksOnly ? await searchPagesLocal(query, 6) : [];
    const works = worksOnly || !pagesOnly ? await searchWorksDb(query, page, typeHint) : [];

    return {
      tool: "searchAll",
      data: {
        ok: true,
        query,
        type: typeHint ?? "ALL",
        pages,
        works,
      },
    };
  }

  // 6) Tags
  if (/\b(tags|etiquetas)\b/i.test(text)) {
    const tags = await prisma.tag.findMany({
      orderBy: [{ name: "asc" }],
      take: 60,
      select: { name: true, slug: true },
    });
    return { tool: "listTags", data: { ok: true, tags } };
  }

  // 7) Fallback: concepto corto
  const qNorm = normalizeTxt(query);
  const isShortConcept =
    qNorm.length >= 2 && qNorm.length <= 40 && qNorm.split(/\s+/).length <= 4;

  if (isShortConcept) {
    const pages = await searchPagesLocal(query, 6);
    if (pages.length) return { tool: "searchPages", data: { ok: true, query, items: pages } };

    if (qNorm.length >= 3) {
      const works = await searchWorksDb(query, { ...page, take: 8 }, typeHint);
      if (works.length) {
        return {
          tool: "searchWorks",
          data: { ok: true, query, type: typeHint ?? "ALL", items: works },
        };
      }
    }
  }

  return { tool: "none", data: null };
}
