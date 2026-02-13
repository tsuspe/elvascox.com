// scripts/genSitePages.mjs
// Genera src/lib/sitePages.generated.ts a partir de src/app/**/page.(ts|tsx|js|jsx)
// Objetivo: índice de páginas "buscable" por Search + Assistant + futuras IAs/SEO.
//
// Uso:
//   node scripts/genSitePages.mjs
//
// Recomendado en package.json:
//   "gen:sitepages": "node scripts/genSitePages.mjs"
//   "dev": "npm run gen:sitepages && next dev"
//   "build": "npm run gen:sitepages && next build"

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const OUT_FILE = path.join(ROOT, "src", "lib", "sitePages.generated.ts");

const PAGE_FILENAMES = new Set(["page.tsx", "page.ts", "page.jsx", "page.js"]);

// Carpetas que solemos ignorar en app/
const IGNORE_DIRS = new Set([
  "api",
  "admin",
  "components",
  "lib",
  "hooks",
  "__tests__",
  "__test__",
  "__mocks__",
  "assets",
]);

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

/* =======================
   ROUTE RULES
======================= */

function shouldIgnoreSegment(seg) {
  if (!seg) return true;
  if (seg.startsWith(".")) return true; // .gitkeep etc
  if (seg.startsWith("_")) return true; // _private
  if (seg.startsWith("@")) return true; // parallel routes
  if (seg.startsWith("(") && seg.endsWith(")")) return true; // route groups
  if (seg.startsWith("[")) return true; // dynamic
  return false;
}

function filePathToHref(filePath) {
  const rel = toPosix(path.relative(APP_DIR, filePath)); // ej: "tattoo/blackout/page.tsx"
  const parts = rel.split("/");
  parts.pop(); // filename

  const segs = parts.filter(Boolean);

  for (const s of segs) {
    if (shouldIgnoreSegment(s)) return null;
    if (IGNORE_DIRS.has(s)) return null;
  }

  const href = "/" + segs.join("/");
  return href === "/home" ? "/" : href;
}

/* =======================
   TEXT HELPERS
======================= */

function extractFirst(src, regex) {
  const m = src.match(regex);
  if (!m) return null;
  return (m[1] ?? m[2] ?? "").trim() || null;
}

function normalizeSpaces(str) {
  return String(str ?? "").replace(/\s+/g, " ").trim();
}

function unescapeBasic(str) {
  return String(str ?? "")
    .replace(/\\n/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .trim();
}

// decode básico de HTML entities sin deps
function decodeHtmlEntities(str) {
  let s = String(str ?? "");
  if (!s) return s;

  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // numeric entities: &#NNN; y &#xHHH;
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return "";
    }
  });
  s = s.replace(/&#(\d+);/g, (_, num) => {
    try {
      return String.fromCodePoint(parseInt(num, 10));
    } catch {
      return "";
    }
  });

  return s;
}

function looksLikePlaceholder(str) {
  const s = String(str ?? "").trim();
  if (!s) return false;
  if (/^\{[^}]{1,200}\}$/.test(s)) return true; // "{HERO.copy}"
  if (/\{[a-zA-Z0-9_.]{1,120}\}/.test(s)) return true;
  return false;
}

function looksLikeCode(str) {
  const s = String(str ?? "");
  if (!s) return false;

  const hard = [
    "export ",
    "import ",
    " from ",
    "function ",
    "=>",
    "return ",
    "const ",
    "let ",
    "var ",
    "type ",
    "interface ",
    "enum ",
    "extends ",
    "implements ",
    "await ",
    "async ",
    "Promise",
    "prisma.",
    "useState",
    "useEffect",
    "useMemo",
    "useRef",
    "useCallback",
    "dangerouslySetInnerHTML",
    "NextResponse",
    "NextRequest",
  ];
  if (hard.some((k) => s.includes(k))) return true;

  if (/\{[^}]{0,120}\blength\s*\?\s*\(/.test(s)) return true; // {tagNames.length ? (
  if (/\{[^}]{0,200}\?\s*\(.{0,200}:\s*\(/.test(s)) return true; // ternarios
  if (/\)\s*:\s*null/.test(s)) return true;
  if (/\{[^}]{0,200}\bmap\s*\(/.test(s)) return true;
  if (/\{[^}]{0,200}\bfilter\s*\(/.test(s)) return true;
  if (/\{[^}]{0,200}\breduce\s*\(/.test(s)) return true;

  if (/<\/?[A-Za-z][^>]*>/.test(s)) return true;
  if (/\b(className|aria-|data-|onClick|onSubmit|onChange|href=|src=|alt=|rel=|target=)\b/.test(s))
    return true;

  const braces = (s.match(/[{}()[\];]/g) || []).length;
  if (braces >= 8) return true;

  return false;
}

function looksLikeJunk(str) {
  const s = String(str ?? "");
  if (!s) return true;
  const t = s.toLowerCase();

  if (
    t.includes("text-zinc") ||
    t.includes("bg-black") ||
    t.includes("rounded-") ||
    t.includes("px-") ||
    t.includes("py-") ||
    t.includes("border-") ||
    t.includes("hover:") ||
    t.includes("transition") ||
    t.includes("object-cover") ||
    t.includes("aspect-[") ||
    t.includes("noopener") ||
    t.includes("noreferrer") ||
    t.includes("allowfullscreen")
  )
    return true;

  if (/^[\s•·|/\\—–\-–—]{1,40}$/.test(s)) return true;
  if (/^[$€#@^*(){}\[\]<>]{1,40}$/.test(s)) return true;

  if (/[)}]{2,}\s*$/.test(s) && s.length < 120) return true;

  return false;
}

function sanitizeText(str, { maxLen = 260, allowShort = true } = {}) {
  let s = unescapeBasic(str);
  s = decodeHtmlEntities(s);
  s = normalizeSpaces(s);
  if (!s) return null;

  if (!allowShort && s.length < 20) return null;

  s = s.replace(/https?:\/\/[^\s)]+/gi, "").trim();

  if (looksLikePlaceholder(s)) return null;
  if (looksLikeCode(s)) return null;
  if (looksLikeJunk(s)) return null;

  if (/[{}]/.test(s)) return null;

  if (s.length > 12000) s = s.slice(0, 12000);
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen).trim();

  s = s.replace(/[,\s]+$/g, "").trim();
  return s || null;
}

function uniqClean(arr, limit = 400) {
  const seen = new Set();
  const out = [];
  for (const x of arr || []) {
    const s = normalizeSpaces(String(x ?? ""));
    if (!s) continue;

    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);

    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

/* =======================
   NAV / MENU FILTER
   (esto es la clave del “production-ready”)
======================= */

const NAV_TOKENS = new Set([
  // nav general
  "home",
  "inicio",
  "archivo",
  "works",
  "work",
  "bio",
  "contacto",
  "booking",
  "galería",
  "galeria",
  "filtros",
  "buscar",
  "search",
  "tags",
  "tag",
  "todo",
  "últimos",
  "ultimos",
  "publicados",
  "publicado",
  "ver",
  "ir",
  "volver",
  // secciones típicas
  "arte",
  "film",
  "música",
  "musica",
  "tattoo",
  "dev",
  "journal",
  // home widgets
  "featured",
  "latest",
  "drops",
]);

function tokeniseWords(line) {
  const s = String(line ?? "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[(){}[\]]/g, " ")
    .replace(/[.,;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return [];
  return s.split(" ").filter(Boolean);
}

function looksLikeNavLine(line) {
  const s = normalizeSpaces(line);
  if (!s) return true;

  // 1) líneas tipo "Contacto / Booking"
  if (s.includes(" / ") && s.length <= 140) return true;

  // 2) líneas muy cortas que son literalmente tabs
  if (s.length <= 28) {
    const w = tokeniseWords(s);
    if (w.length >= 1 && w.length <= 3 && w.every((x) => NAV_TOKENS.has(x))) return true;
  }

  // 3) si contiene muchas palabras de nav en poco texto, fuera
  const words = tokeniseWords(s);
  if (words.length >= 3) {
    const hits = words.filter((w) => NAV_TOKENS.has(w)).length;

    // regla fuerte: 3+ hits en línea corta => menú
    if (hits >= 3 && s.length <= 160) return true;

    // regla “tabs”: la mayoría son tokens cortos y de nav
    const shortish = words.filter((w) => w.length <= 8).length;
    const navish = words.filter((w) => NAV_TOKENS.has(w)).length;

    if (words.length >= 6 && s.length <= 180 && shortish / words.length > 0.85 && navish / words.length > 0.45)
      return true;
  }

  // 4) capitalización tipo “lista de secciones” (poca puntuación, muchas palabras TitleCase)
  if (s.length <= 160 && !/[.?!]/.test(s)) {
    const ws = s.split(/\s+/g).filter(Boolean);
    if (ws.length >= 6) {
      const cap = ws.filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w)).length;
      if (cap / ws.length > 0.75) return true;
    }
  }

  return false;
}

/* =======================
   CONST RESOLVER
======================= */

function buildConstStringMap(src) {
  const map = new Map();
  const re = /\bconst\s+([A-Z0-9_]{2,80})\s*=\s*([`"'])([\s\S]*?)\2\s*;?/g;

  for (const m of src.matchAll(re)) {
    const name = m[1];
    const val = m[3];

    const safe = sanitizeText(val, { maxLen: 1200, allowShort: true });
    if (name && safe) map.set(name, safe);
  }

  return map;
}

function resolveMaybeIdentifier(raw, constMap) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (/^[A-Z0-9_]{2,80}$/.test(s)) return constMap.get(s) ?? null;
  return s;
}

/* =======================
   JSX STRIPPING (sin parser)
======================= */

function stripJsxComments(src) {
  return String(src ?? "").replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");
}

// elimina expresiones { ... } equilibradas, saltando strings / template strings
function stripBalancedBraces(src) {
  const s = String(src ?? "");
  let out = "";

  let i = 0;

  let inS = false; // '
  let inD = false; // "
  let inT = false; // `
  let esc = false;

  while (i < s.length) {
    const ch = s[i];

    if (inS || inD || inT) {
      out += ch;

      if (esc) {
        esc = false;
        i++;
        continue;
      }

      if (ch === "\\") {
        esc = true;
        i++;
        continue;
      }

      if (inS && ch === "'") inS = false;
      else if (inD && ch === '"') inD = false;
      else if (inT && ch === "`") inT = false;

      i++;
      continue;
    }

    if (ch === "'") {
      inS = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inD = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === "`") {
      inT = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === "{") {
      let depth = 1;
      i++;

      let blockInS = false,
        blockInD = false,
        blockInT = false,
        blockEsc = false;

      while (i < s.length && depth > 0) {
        const c = s[i];

        if (blockInS || blockInD || blockInT) {
          if (blockEsc) {
            blockEsc = false;
            i++;
            continue;
          }
          if (c === "\\") {
            blockEsc = true;
            i++;
            continue;
          }
          if (blockInS && c === "'") blockInS = false;
          else if (blockInD && c === '"') blockInD = false;
          else if (blockInT && c === "`") blockInT = false;

          i++;
          continue;
        }

        if (c === "'") {
          blockInS = true;
          i++;
          continue;
        }
        if (c === '"') {
          blockInD = true;
          i++;
          continue;
        }
        if (c === "`") {
          blockInT = true;
          i++;
          continue;
        }

        if (c === "{") depth++;
        else if (c === "}") depth--;

        i++;
      }

      out += " ";
      continue;
    }

    out += ch;
    i++;
  }

  return out;
}

/* =======================
   CONTENT EXTRACTOR
======================= */

const TEXT_PROPS = [
  "title",
  "subtitle",
  "desc",
  "description",
  "text",
  "intro",
  "label",
  "noteTitle",
  "noteText",
  "manifestoTitle",
  "manifestoText",
  "meta",
  "kicker",
  "lead",
];

function stripJsxExprLoose(s) {
  return String(s ?? "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// prop="..." | prop='...' | prop={`...`} | prop={"..."} | prop={'...'}
function extractStringProps(src, propName) {
  const out = [];

  const a = new RegExp(`${propName}\\s*=\\s*"([^"]{2,1200})"`, "g");
  const b = new RegExp(`${propName}\\s*=\\s*'([^']{2,1200})'`, "g");
  const c = new RegExp(`${propName}\\s*=\\s*\\{\\s*\\\`([\\s\\S]{2,1200}?)\\\`\\s*\\}`, "g");
  const d = new RegExp(`${propName}\\s*=\\s*\\{\\s*"([^"]{2,1200})"\\s*\\}`, "g");
  const e = new RegExp(`${propName}\\s*=\\s*\\{\\s*'([^']{2,1200})'\\s*\\}`, "g");

  for (const m of src.matchAll(a)) out.push(m[1]);
  for (const m of src.matchAll(b)) out.push(m[1]);
  for (const m of src.matchAll(c)) out.push(m[1]);
  for (const m of src.matchAll(d)) out.push(m[1]);
  for (const m of src.matchAll(e)) out.push(m[1]);

  return out.map(stripJsxExprLoose).filter(Boolean);
}

function extractStringArrayProp(src, propName) {
  const out = [];
  const re = new RegExp(`${propName}\\s*=\\s*\\{\\s*\\[([\\s\\S]*?)\\]\\s*\\}`, "g");

  for (const m of src.matchAll(re)) {
    const inside = m[1] ?? "";
    for (const s of inside.matchAll(/"([^"]{2,800})"|\'([^\']{2,800})\'/g)) {
      out.push(s[1] || s[2]);
    }
  }

  return out.map(stripJsxExprLoose).filter(Boolean);
}

function extractPropStrings(src, constMap) {
  const out = [];

  for (const p of TEXT_PROPS) out.push(...extractStringProps(src, p));

  // props={IDENTIFIER}
  const propIdRe = new RegExp(`\\b(?:${TEXT_PROPS.join("|")})\\s*=\\s*{([A-Z0-9_]{2,80})}`, "g");
  for (const m of src.matchAll(propIdRe)) {
    const val = resolveMaybeIdentifier(m[1], constMap);
    const s = sanitizeText(val, { maxLen: 520, allowShort: true });
    if (s) out.push(s);
  }

  // subtitle={<> ... </>}
  const fragmentRe = /\bsubtitle\s*=\s*{<>[\s\S]*?<\/>}/g;
  for (const m of src.matchAll(fragmentRe)) {
    const block = m[0];
    const plain = normalizeSpaces(
      block
        .replace(/^.*{<>/s, "")
        .replace(/<\/>}.*$/s, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\{[\s\S]*?\}/g, " ")
    );
    const s = sanitizeText(plain, { maxLen: 700, allowShort: true });
    if (s) out.push(s);
  }

  out.push(...extractStringArrayProp(src, "items"));
  out.push(...extractStringArrayProp(src, "chips"));
  out.push(...extractStringArrayProp(src, "notes"));
  out.push(...extractStringArrayProp(src, "pills"));

  return out;
}

function extractTextNodesFromJsx(src) {
  const out = [];

  const tags = [
    "p",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "strong",
    "em",
    "P",
    "H1",
    "H2",
    "H3",
    "Lead",
    "Kicker",
    "Quote",
    "CTA",
  ];

  const cleaned = stripBalancedBraces(stripJsxComments(src));

  for (const t of tags) {
    const re = new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, "g");
    for (const m of cleaned.matchAll(re)) {
      const inner = m[1].replace(/<[^>]+>/g, " ");
      const plain = normalizeSpaces(inner);
      const s = sanitizeText(plain, { maxLen: 900, allowShort: false });
      if (s) out.push(s);
    }
  }

  for (const m of cleaned.matchAll(/>([^<]{20,800})</g)) {
    const raw = normalizeSpaces(m[1]);
    if (!raw) continue;
    if (/[{}]/.test(raw)) continue;

    const s = sanitizeText(raw, { maxLen: 520, allowShort: false });
    if (s) out.push(s);
  }

  return out;
}

function extractItemsArrays(src) {
  const out = [];
  const itemsBlockRe = /\bitems\s*:\s*\[([\s\S]*?)\]/g;

  for (const m of src.matchAll(itemsBlockRe)) {
    const body = m[1] ?? "";
    const ks = [...body.matchAll(/["'`]([\s\S]*?)["'`]/g)].map((x) => x[1]).filter(Boolean);

    for (const k of ks) {
      const s = sanitizeText(k, { maxLen: 520, allowShort: true });
      if (s) out.push(s);
    }
  }

  return out;
}

function buildContentFromSource(src) {
  const constMap = buildConstStringMap(src);

  const rawParts = [
    ...extractPropStrings(src, constMap),
    ...extractTextNodesFromJsx(src),
    ...extractItemsArrays(src),
  ];

  // sanitize por pieza
  const parts = [];
  for (const p of rawParts) {
    const s = sanitizeText(p, { maxLen: 1200, allowShort: true });
    if (!s) continue;
    if (looksLikeNavLine(s)) continue; // 🔥 aquí se limpia el menú de raíz
    parts.push(s);
  }

  const clean = uniqClean(parts, 900);
  if (!clean.length) return null;

  const joined = clean.join("\n").trim();
  if (!joined) return null;

  return joined.length > 4000 ? joined.slice(0, 4000).trim() : joined;
}

/* =======================
   META EXTRACTOR
======================= */

function extractMetaFromSource(src) {
  const constMap = buildConstStringMap(src);

  const titleLit =
    extractFirst(src, /metadata\s*=\s*{[\s\S]*?\btitle\s*:\s*["'`](.*?)["'`]/m) ||
    extractFirst(src, /return\s*{[\s\S]*?\btitle\s*:\s*["'`](.*?)["'`]/m) ||
    extractFirst(src, /<title>\s*([^<]{1,160})\s*<\/title>/m);

  const titleId =
    extractFirst(src, /metadata\s*=\s*{[\s\S]*?\btitle\s*:\s*([A-Z0-9_]{2,80})\b/m) ||
    extractFirst(src, /return\s*{[\s\S]*?\btitle\s*:\s*([A-Z0-9_]{2,80})\b/m);

  const titleRaw = titleLit ?? (titleId ? resolveMaybeIdentifier(titleId, constMap) : null);

  const descLit =
    extractFirst(src, /metadata\s*=\s*{[\s\S]*?\bdescription\s*:\s*["'`](.*?)["'`]/m) ||
    extractFirst(src, /return\s*{[\s\S]*?\bdescription\s*:\s*["'`](.*?)["'`]/m);

  const descId =
    extractFirst(src, /metadata\s*=\s*{[\s\S]*?\bdescription\s*:\s*([A-Z0-9_]{2,80})\b/m) ||
    extractFirst(src, /return\s*{[\s\S]*?\bdescription\s*:\s*([A-Z0-9_]{2,80})\b/m);

  const descriptionRaw = descLit ?? (descId ? resolveMaybeIdentifier(descId, constMap) : null);

  let keywords = null;

  const kwArrayMatch = src.match(/keywords\s*:\s*\[([\s\S]*?)\]/m);
  if (kwArrayMatch?.[1]) {
    const body = kwArrayMatch[1];
    const ks = [...body.matchAll(/["'`](.*?)["'`]/g)].map((m) => m[1]).filter(Boolean);
    const cleaned = ks.map((k) => sanitizeText(k, { maxLen: 60, allowShort: true })).filter(Boolean);
    if (cleaned.length) keywords = uniqClean(cleaned, 40);
  }

  if (!keywords) {
    const kwStr =
      extractFirst(src, /metadata\s*=\s*{[\s\S]*?\bkeywords\s*:\s*["'`](.*?)["'`]/m) ||
      extractFirst(src, /return\s*{[\s\S]*?\bkeywords\s*:\s*["'`](.*?)["'`]/m);
    if (kwStr) {
      const cleaned = kwStr
        .split(",")
        .map((x) => sanitizeText(x, { maxLen: 60, allowShort: true }))
        .filter(Boolean);
      if (cleaned.length) keywords = uniqClean(cleaned, 40);
    }
  }

  const excerptRaw =
    extractFirst(src, /\bEXCERPT\s*=\s*["'`]([\s\S]*?)["'`]\s*;?/m) ||
    extractFirst(src, /\bLead\b[^>]*>\s*([^<]{30,260})\s*</m) ||
    extractFirst(src, /<p[^>]*>\s*([^<]{30,260})\s*<\/p>/m);

  const title = sanitizeText(titleRaw, { maxLen: 90, allowShort: true });
  const description = sanitizeText(descriptionRaw, { maxLen: 220, allowShort: true });
  const excerpt = sanitizeText(excerptRaw, { maxLen: 260, allowShort: false });

  return { title, description, keywords: keywords?.length ? keywords : null, excerpt };
}

/* =======================
   LABELS / FALLBACKS
======================= */

function titleFromHref(href) {
  if (href === "/") return "Home";
  const seg = href.split("/").filter(Boolean).slice(-1)[0] || "Page";
  return seg.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function keywordsFromHref(href) {
  const segs = href.split("/").filter(Boolean);
  const base = segs
    .flatMap((s) => s.split(/[-_]+/g))
    .map((s) => s.toLowerCase())
    .filter(Boolean);

  const stop = new Set(["the", "a", "an", "and", "of", "to", "el", "la", "los", "las", "de", "y"]);
  return [...new Set(base.filter((k) => !stop.has(k)))].slice(0, 16);
}

function labelsFromHref(href) {
  const segs = href.split("/").filter(Boolean);
  if (!segs.length) return ["home"];

  const top = segs[0].toLowerCase();

  const map = {
    tattoo: "tattoo",
    musica: "music",
    film: "film",
    arte: "art",
    dev: "dev",
    journal: "journal",
    booking: "booking",
    contacto: "contact",
    bio: "bio",
    search: "search",
    work: "work",
  };

  const labels = [];
  labels.push(map[top] ?? top);

  // resto de segmentos como labels, y además tokenizados por - _
  for (const seg of segs.slice(1)) {
    const raw = String(seg ?? "").toLowerCase().trim();
    if (!raw) continue;

    labels.push(raw);

    const pieces = raw.split(/[-_]+/g).map((x) => x.trim()).filter(Boolean);
    for (const p of pieces) {
      // evita meter tokens ultra genéricos
      if (p.length <= 1) continue;
      labels.push(p);
    }
  }

  return uniqClean(labels, 16);
}

function sectionFromHref(href) {
  const segs = href.split("/").filter(Boolean);
  return segs[0]?.toLowerCase() ?? "home";
}

/* =======================
   EXCERPT PICKER
======================= */

function pickExcerpt({ metaExcerpt, content, description, title }) {
  // 1) meta.excerpt si existe
  const fromMeta = sanitizeText(metaExcerpt, { maxLen: 260, allowShort: false });
  if (fromMeta) return fromMeta;

  // 2) primer bloque decente del content (no nav)
  if (content) {
    const lines = String(content)
      .split("\n")
      .map((l) => normalizeSpaces(l))
      .filter(Boolean);

    for (const line of lines) {
      if (looksLikeNavLine(line)) continue;

      // preferimos frases con “intención”: puntuación o longitud razonable
      const s = sanitizeText(line, { maxLen: 260, allowShort: false });
      if (!s) continue;

      // evita titulares vacíos tipo "Galería · Arte & Photo"
      const words = tokeniseWords(s);
      if (words.length <= 3 && s.length <= 40) continue;

      return s;
    }

    // fallback: recorte del content completo
    const chunk = sanitizeText(content, { maxLen: 260, allowShort: false });
    if (chunk) return chunk;
  }

  // 3) description
  const fromDesc = sanitizeText(description, { maxLen: 260, allowShort: false });
  if (fromDesc) return fromDesc;

  return `Contenido de ${title || "esta sección"}.`;
}

/* =======================
   WALK
======================= */

function walk(dir, outFiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const ent of entries) {
    const abs = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      if (shouldIgnoreSegment(ent.name)) continue;
      walk(abs, outFiles);
      continue;
    }

    if (ent.isFile() && PAGE_FILENAMES.has(ent.name)) outFiles.push(abs);
  }

  return outFiles;
}

function uniqByHref(pages) {
  const map = new Map();
  for (const p of pages) map.set(p.href, p);
  return [...map.values()];
}

function sortPages(pages) {
  return pages.sort((a, b) => {
    if (a.href === "/" && b.href !== "/") return -1;
    if (b.href === "/" && a.href !== "/") return 1;
    return a.href.localeCompare(b.href);
  });
}

/* =======================
   TS OUTPUT
======================= */

function genTs(pages) {
  const lines = [];
  lines.push(`/* eslint-disable */`);
  lines.push(`// AUTO-GENERATED FILE. DO NOT EDIT.`);
  lines.push(`// Generated by scripts/genSitePages.mjs`);
  lines.push(``);
  lines.push(`export type SitePage = {`);
  lines.push(`  href: string;`);
  lines.push(`  title: string;`);
  lines.push(`  section?: string;`);
  lines.push(`  labels?: string[];`);
  lines.push(`  description?: string;`);
  lines.push(`  keywords?: string[];`);
  lines.push(`  excerpt?: string;`);
  lines.push(`  content?: string;`);
  lines.push(`};`);
  lines.push(``);
  lines.push(`export const SITE_PAGES: SitePage[] = [`);

  for (const p of pages) {
    const obj = {
      href: p.href,
      title: p.title,
      ...(p.section ? { section: p.section } : {}),
      ...(p.labels?.length ? { labels: p.labels } : {}),
      ...(p.description ? { description: p.description } : {}),
      ...(p.keywords?.length ? { keywords: p.keywords } : {}),
      ...(p.excerpt ? { excerpt: p.excerpt } : {}),
      ...(p.content ? { content: p.content } : {}),
    };

    const json = JSON.stringify(obj, null, 2)
      .split("\n")
      .map((l) => "  " + l)
      .join("\n");

    lines.push(`${json},`);
  }

  lines.push(`];`);
  lines.push(``);
  return lines.join("\n");
}

/* =======================
   MAIN
======================= */

function main() {
  if (!exists(APP_DIR)) {
    console.error("[genSitePages] No existe src/app. Abort.");
    process.exit(1);
  }

  const pageFiles = walk(APP_DIR);
  const pages = [];

  for (const file of pageFiles) {
    const href = filePathToHref(file);
    if (!href) continue;

    if (href.startsWith("/api")) continue;
    if (href.startsWith("/admin")) continue;

    const src = readText(file);
    const meta = extractMetaFromSource(src);

    const titleRaw = meta.title || titleFromHref(href);
    const descriptionRaw = meta.description || "";
    const keywords = meta.keywords?.length ? meta.keywords : keywordsFromHref(href);

    const safeTitle =
      sanitizeText(titleRaw, { maxLen: 90, allowShort: true }) || titleFromHref(href);

    const safeDesc =
      sanitizeText(descriptionRaw, { maxLen: 220, allowShort: true }) || `Sección: ${safeTitle}.`;

    const content = buildContentFromSource(src);
    const safeContent = content ? sanitizeText(content, { maxLen: 4000, allowShort: true }) : null;

    const excerpt = pickExcerpt({
      metaExcerpt: meta.excerpt,
      content: safeContent,
      description: safeDesc,
      title: safeTitle,
    });

    const labels = labelsFromHref(href);
    const section = sectionFromHref(href);

    pages.push({
      href,
      title: safeTitle,
      section,
      labels,
      ...(safeDesc ? { description: safeDesc } : {}),
      ...(keywords?.length ? { keywords: uniqClean(keywords, 40) } : {}),
      ...(excerpt ? { excerpt } : {}),
      ...(safeContent ? { content: safeContent } : {}),
    });
  }

  const finalPages = sortPages(uniqByHref(pages));

  const outDir = path.dirname(OUT_FILE);
  if (!exists(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUT_FILE, genTs(finalPages), "utf8");

  console.log(
    `[genSitePages] OK: ${finalPages.length} páginas -> ${path.relative(ROOT, OUT_FILE)}`
  );
}

main();
