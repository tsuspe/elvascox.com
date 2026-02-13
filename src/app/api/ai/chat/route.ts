// src/app/api/ai/chat/route.ts
import { runToolIfNeeded } from "@/lib/ai/toolRunner";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

function stripUrls(s: string) {
  return String(s ?? "")
    .replace(/https?:\/\/[^\s)]+/gi, "")
    .replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, "")
    .trim();
}

function summarizeRecent(messages: Msg[], limit = 10) {
  const tail = messages.slice(-limit);
  const lines = tail.map((m) => {
    const role = m.role === "user" ? "U" : "A";
    const txt = stripUrls(m.content).replace(/\s+/g, " ").slice(0, 160);
    return `${role}: ${txt}`;
  });
  return lines.join("\n");
}

function buildSystemPrompt(page: any, toolRes: any, messages: Msg[]) {
  const ctx = JSON.stringify(page ?? {}, null, 2);
  const tool = JSON.stringify(toolRes ?? null, null, 2);
  const memory = summarizeRecent(messages, 10);

  return `
Eres el asistente de elvasco.x, con la voz de “El Vasco”.

OBJETIVO
Ayudar al usuario a entender dónde está, resolver dudas y moverse por el sitio sin fricción.

TONO (vasco suave)
- 1 frase corta de colega al empezar, si encaja (máx 12 palabras).
- Directo, sin postureo. Underground, claro.
- Micro-sarcasmo solo si suma, nunca para confundir.
- Si algo es ambiguo, pregunta o da 2 opciones claras.

REGLAS DURAS
- NO inventes rutas ni secciones.
- Si toolRes trae datos, eso es verdad absoluta para el contenido del archivo.
- /work y /search existen siempre.
- NO markdown. NO URLs (http/https) en el reply.
- Si vas a dirigir, usa actions. En el texto solo rutas relativas cortas.
- Devuelve SOLO JSON.

FORMATO
{ "reply": "texto" }

MEMORIA CORTA (últimos mensajes)
${memory}

Contexto de la página:
${ctx}

Datos reales (toolRes):
${tool}
`.trim();
}

/* =======================
   CALLS
======================= */

async function callOpenRouter(payload: any) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");

  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://elvascox.com",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "elvasco.x",
    },
    body: JSON.stringify({
      model,
      messages: payload.messages,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter error ${res.status}: ${txt}`);
  }

  const json = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? "");
}

async function callOllama(payload: any) {
  const model = process.env.OLLAMA_MODEL ?? "llama3.1:8b";
  const base = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: payload.messages,
      stream: false,
      options: { temperature: 0.5 },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Ollama error ${res.status}: ${txt}`);
  }

  const json = await res.json();
  return String(json?.message?.content ?? "");
}

/* =======================
   JSON & SANITIZE
======================= */

function parseJsonStrict(raw: string) {
  const s = (raw ?? "").trim();
  if (!s.startsWith("{")) return null;

  try {
    return JSON.parse(s);
  } catch {}

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(s.slice(start, end + 1));
    } catch {}
  }
  return null;
}

function sanitizeReplyText(reply: string) {
  // OJO: preserva saltos de línea, pero limpia URLs / IPs y espacios raros
  let s = String(reply ?? "").trim();
  s = s.replace(/https?:\/\/[^\s)]+/gi, "");
  s = s.replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, "");
  s = s.replace(/[ \t]{2,}/g, " ").trim(); // no tocar \n
  s = s.replace(/\n{3,}/g, "\n\n");
  return s || "Ok.";
}

async function enforceJsonOnce(
  runner: (payload: any) => Promise<string>,
  payload: any,
  raw: string
) {
  const parsed = parseJsonStrict(raw);
  if (parsed && typeof parsed === "object") return raw;

  return await runner({
    messages: [
      ...payload.messages,
      {
        role: "system",
        content:
          'IMPORTANTE: Devuelve SOLO JSON válido con { "reply": "..." }. Sin texto extra.',
      },
    ],
  });
}

/* =======================
   PAGE NORMALIZE
======================= */

function normalizePage(page: any) {
  const loc = String(page?.locationPath ?? "").trim();
  const sp = String(page?.queryString ?? "").trim();
  const pathname = loc.startsWith("/") ? loc : String(page?.pathname ?? "");
  const queryString = sp;
  return { ...page, pathname, queryString };
}

/* =======================
   SPECIAL PAGES
======================= */

function isInternal(href: string) {
  return typeof href === "string" && href.startsWith("/");
}

function getSpecialBlackoutHref() {
  const href = String(process.env.SPECIAL_BLACKOUT_HREF ?? "").trim();
  return href && isInternal(href) ? href : "";
}

/* =======================
   NAV INTENTS
======================= */

type NavIntent =
  | { kind: "GO"; href: string; label: string; reply: string }
  | { kind: "CHOICE"; options: Array<{ href: string; label: string }>; reply: string }
  | { kind: "NONE" };

function detectNavIntent(userText: string): NavIntent {
  const t = String(userText ?? "").toLowerCase().trim();
  if (!t) return { kind: "NONE" };

  const wantsGo =
    /\b(ll[eé]vame|lleva|vamos|ir a|abre|abrir|ve a|quiero ir a)\b/.test(t);

  const wantsWorks =
    /\b(works|archivo|archivo de|en el archivo|dentro del archivo)\b/.test(t);

  const wantsBlackoutPage =
    /\b(p[aá]gina|page)\b.*\bblackout\b/.test(t) ||
    /\bblackout\b.*\b(p[aá]gina|page)\b/.test(t);

  if (wantsBlackoutPage) {
    const href = getSpecialBlackoutHref();
    if (href) {
      return {
        kind: "GO",
        href,
        label: "Página Blackout",
        reply: "Vale, te abro la página de blackout.",
      };
    }
    return { kind: "NONE" };
  }

  // “works de film” / “archivo film” (aunque no diga llévame)
  if (/\bfilm\b/.test(t) && (wantsWorks || /\bworks\b.*\bfilm\b|\bfilm\b.*\bworks\b/.test(t))) {
    return {
      kind: "GO",
      href: "/work?type=FILM",
      label: "Film (archivo)",
      reply: "Te llevo a Film dentro del archivo.",
    };
  }

  if (!wantsGo) return { kind: "NONE" };

  // Ambiguos: ofrezco sección y archivo
  if (/\bfilm\b|\bcine\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Film como sección o Film dentro del archivo?",
      options: [
        { href: "/film", label: "Film (sección)" },
        { href: "/work?type=FILM", label: "Film (archivo)" },
      ],
    };
  }

  if (/\btattoo\b|\btatu\b|\btatuaje(s)?\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Tattoo como sección o dentro del archivo?",
      options: [
        { href: "/tattoo", label: "Tattoo (sección)" },
        { href: "/work?type=TATTOO", label: "Tattoo (archivo)" },
      ],
    };
  }

  if (/\bm[uú]sica\b|\bmusic\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Música como sección o dentro del archivo?",
      options: [
        { href: "/musica", label: "Música (sección)" },
        { href: "/work?type=MUSIC", label: "Música (archivo)" },
      ],
    };
  }

  if (/\barte\b|\bart\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Arte como sección o dentro del archivo?",
      options: [
        { href: "/arte", label: "Arte (sección)" },
        { href: "/work?type=ART", label: "Arte (archivo)" },
      ],
    };
  }

  if (/\bdev\b|\bia\b|\bai\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Dev+AI como sección o dentro del archivo?",
      options: [
        { href: "/dev", label: "Dev+AI (sección)" },
        { href: "/work?type=DEV", label: "Dev+AI (archivo)" },
      ],
    };
  }

  if (/\bjournal\b|\bdiario\b|\bnotas\b/.test(t) && !wantsWorks) {
    return {
      kind: "CHOICE",
      reply: "¿Journal como sección o dentro del archivo?",
      options: [
        { href: "/journal", label: "Journal (sección)" },
        { href: "/work?type=JOURNAL", label: "Journal (archivo)" },
      ],
    };
  }

  // Archivo / búsqueda
  if (/\barchivo\b/.test(t))
    return { kind: "GO", href: "/work", label: "Archivo", reply: "Te llevo al archivo." };
  if (/\b(buscar|b[uú]squeda|search)\b/.test(t))
    return { kind: "GO", href: "/search", label: "Buscar", reply: "Te abro búsqueda." };

  return { kind: "NONE" };
}

/* =======================
   ACTIONS
======================= */

function buildActionsDeterministic(
  toolRes: any,
  page: any,
  extra?: Array<{ label: string; href: string }>,
  opts?: { extraFirst?: boolean }
) {
  const actions: Array<{ label: string; href: string }> = [];
  const pathname = String(page?.pathname ?? "");

  const push = (label: string, href: string) => {
    if (!isInternal(href)) return;
    if (actions.some((a) => a.href === href)) return;
    actions.push({ label: String(label ?? "").slice(0, 60), href });
  };

  const extraFirst = opts?.extraFirst ?? false;

  if (extraFirst) {
    for (const a of extra ?? []) push(a.label, a.href);
  }

  // base
  if (!pathname.startsWith("/work")) push("Archivo", "/work");
  push("Buscar", "/search");

  if (!extraFirst) {
    for (const a of extra ?? []) push(a.label, a.href);
  }

  // works context
  if (toolRes?.tool === "getWorkBySlug") {
    const w = toolRes?.data?.work;
    if (w?.type) push(`Más de ${String(w.type).toLowerCase()}`, `/work?type=${w.type}`);
  }
  if (toolRes?.tool === "searchWorks") {
    for (const it of (toolRes?.data?.items ?? []).slice(0, 2)) {
      if (it?.title && it?.href) push(it.title, it.href);
    }
  }

  // pages hits
  if (toolRes?.tool === "searchPages") {
    for (const p of (toolRes?.data?.items ?? []).slice(0, 2)) {
      if (p?.title && p?.href) push(p.title, p.href);
    }
  }
  if (toolRes?.tool === "getPageByPath") {
    const p = toolRes?.data?.page;
    if (p?.title && p?.href) push(p.title, p.href);
  }

  return actions.slice(0, 4);
}

/* =======================
   ROUTE
======================= */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = (body?.messages ?? []) as Msg[];
    const page = normalizePage(body?.page ?? {});

    const lastUserText =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // 1) navegación determinista (incluye “choice”)
    const nav = detectNavIntent(String(lastUserText ?? ""));
    if (nav.kind === "GO") {
      const actions = buildActionsDeterministic(
        { tool: "none", data: null },
        page,
        [{ label: nav.label, href: nav.href }],
        { extraFirst: true }
      );
      return NextResponse.json({ reply: nav.reply, actions });
    }
    if (nav.kind === "CHOICE") {
      const actions = buildActionsDeterministic(
        { tool: "none", data: null },
        page,
        nav.options.map((o) => ({ label: o.label, href: o.href })),
        { extraFirst: true }
      );
      return NextResponse.json({ reply: nav.reply, actions });
    }

    // 2) tool “verdad”
    const toolRes = await runToolIfNeeded({
      userText: String(lastUserText).slice(0, 4000),
      page,
    });

    // 3) getPageByPath
    if (toolRes?.tool === "getPageByPath") {
      const p = toolRes?.data?.page;
      const reply = sanitizeReplyText(
        p?.excerpt || p?.description || (p?.content ? String(p.content).slice(0, 220) : "") || `Estás en ${String(p?.title ?? "una página")} del sitio.`
      );

      const actions = buildActionsDeterministic(toolRes, page);
      return NextResponse.json({ reply, actions });
    }

    // 4) searchPages (keyword suelta tipo “blackout”, “techno”, “acid”, etc.)
    if (toolRes?.tool === "searchPages") {
      const items = (toolRes?.data?.items ?? []) as Array<any>;
      const q = String(toolRes?.data?.query ?? "").trim();

      const topPage = items[0] ?? null;

      const extra: Array<{ label: string; href: string }> = [];

      // especial blackout (si lo configuras) primero
      const blackoutHref = getSpecialBlackoutHref();
      if (blackoutHref && q.toLowerCase().includes("blackout")) {
        extra.push({ label: "Página Blackout", href: blackoutHref });
      }

      if (topPage?.href && topPage?.title) {
        extra.push({ label: topPage.title, href: topPage.href });
      }

      // Y además: si hay obras relacionadas, ofrece una también (sin forzar)
      // Esto no “navega por la web”, pero sí por tu contenido real indexable.
      let relatedWorks: Array<any> = [];
      try {
        const related = await runToolIfNeeded({
          userText: `busca ${q}`,
          page: { ...page, take: 6 },
        });
        relatedWorks =
          related?.tool === "searchAll"
            ? (related?.data?.works ?? [])
            : related?.tool === "searchWorks"
            ? (related?.data?.items ?? [])
            : [];
      } catch {
        relatedWorks = [];
      }

      const topWork = relatedWorks[0] ?? null;
      if (topWork?.href && topWork?.title) {
        extra.push({ label: `Pieza: ${topWork.title}`, href: topWork.href });
      }

      const actions = buildActionsDeterministic(
        { tool: "none", data: null },
        page,
        extra,
        { extraFirst: true }
      );

      let reply = "";
      if (items.length) {
        const pageNames = items.slice(0, 2).map((p: any) => p.title).filter(Boolean);
        reply =
          `Aupa. Para “${q}” tengo páginas que encajan.\n` +
          `Top: ${pageNames.join(" / ")}.\n` +
          (topWork?.title ? `Y también hay una pieza en el archivo relacionada.\n` : "") +
          `¿Abro la página o tiramos de archivo?`;
      } else {
        reply = `No veo página clara para “${q}”. ¿Lo buscas en el archivo o afinamos la palabra?`;
      }

      return NextResponse.json({ reply: sanitizeReplyText(reply), actions });
    }

    // 5) búsqueda global (pages + works)
    if (toolRes?.tool === "searchAll") {
      const q = String(toolRes?.data?.query ?? "").trim();
      const pages = (toolRes?.data?.pages ?? []) as Array<any>;
      const works = (toolRes?.data?.works ?? []) as Array<any>;

      const extra: Array<{ label: string; href: string }> = [];

      // especial blackout opcional (si existe)
      const blackoutHref = getSpecialBlackoutHref();
      if (blackoutHref && q.toLowerCase().includes("blackout")) {
        extra.push({ label: "Página Blackout", href: blackoutHref });
      }

      const topPage = pages[0] ?? null;
      const topWork = works[0] ?? null;

      if (topPage?.href && topPage?.title) {
        extra.push({ label: `Abrir página: ${topPage.title}`, href: topPage.href });
      }
      if (topWork?.href && topWork?.title) {
        extra.push({ label: `Abrir pieza: ${topWork.title}`, href: topWork.href });
      }

      // Si no hay top, metemos hasta 2+2 para que el usuario tenga clicks
      for (const p of pages.slice(0, 2)) {
        if (p?.title && p?.href && p !== topPage) extra.push({ label: p.title, href: p.href });
      }
      for (const w of works.slice(0, 2)) {
        if (w?.title && w?.href && w !== topWork) extra.push({ label: w.title, href: w.href });
      }

      const actions = buildActionsDeterministic(
        { tool: "none", data: null },
        page,
        extra,
        { extraFirst: true }
      );

      const parts: string[] = [];
      if (pages.length) parts.push(`Páginas: ${pages.slice(0, 2).map((p: any) => p.title).join(" / ")}`);
      if (works.length) parts.push(`Archivo: ${works.slice(0, 2).map((w: any) => w.title).join(" / ")}`);

      let reply = "";
      if (pages.length && works.length) {
        reply =
          `Vale. He encontrado “${q}” en el sitio y en el archivo.\n` +
          `${parts.join("\n")}\n` +
          `¿Quieres abrir una página o una pieza del archivo?`;
      } else if (pages.length) {
        reply =
          `Vale. Para “${q}” hay páginas del sitio.\n` +
          `${parts.join("\n")}\n` +
          `¿Abro la más directa?`;
      } else if (works.length) {
        reply =
          `Vale. Para “${q}” hay piezas en el archivo.\n` +
          `${parts.join("\n")}\n` +
          `¿Abro la más arriba o afinamos?`;
      } else {
        reply =
          `No veo nada para “${q}” ni en páginas ni en el archivo.\n` +
          `Prueba otra palabra (o vete a /search y tira de tags).`;
      }

      return NextResponse.json({ reply: sanitizeReplyText(reply), actions });
    }

    // 6) searchWorks (por si llega desde fallback)
    if (toolRes?.tool === "searchWorks") {
      const items = toolRes?.data?.items ?? [];
      const q = String(toolRes?.data?.query ?? "").trim();

      const extra: Array<{ label: string; href: string }> = [];
      const blackoutHref = getSpecialBlackoutHref();
      if (blackoutHref && q.toLowerCase().includes("blackout")) {
        extra.push({ label: "Página Blackout", href: blackoutHref });
      }

      const actions = buildActionsDeterministic(toolRes, page, extra, { extraFirst: true });

      if (items.length) {
        const top = items
          .slice(0, 2)
          .map((it: any) => `- ${it.title}`)
          .join("\n");

        const reply = sanitizeReplyText(
          `He pillado ${items.length} resultados para “${q}”. Los top:\n${top}\n¿Abro uno o afinamos?`
        );

        return NextResponse.json({ reply, actions });
      }

      return NextResponse.json({
        reply: sanitizeReplyText(
          `No veo nada para “${q}” ahora mismo. Prueba otra palabra o busca por tag en /search.`
        ),
        actions,
      });
    }

    // 7) LLM para redactar (con memoria corta)
    const payload = {
      messages: [
        { role: "system", content: buildSystemPrompt(page, toolRes, messages) },
        ...messages.map((m) => ({
          role: m.role,
          content: String(m.content ?? "").slice(0, 4000),
        })),
      ],
    };

    let raw = "";
    try {
      raw = await callOpenRouter(payload);
      raw = await enforceJsonOnce(callOpenRouter, payload, raw);
    } catch {
      raw = await callOllama(payload);
      raw = await enforceJsonOnce(callOllama, payload, raw);
    }

    const parsed = parseJsonStrict(raw) ?? { reply: raw };
    const reply = sanitizeReplyText((parsed as any)?.reply);
    const actions = buildActionsDeterministic(toolRes, page);

    return NextResponse.json({ reply, actions });
  } catch {
    return NextResponse.json(
      { reply: "Error interno en el asistente.", actions: [] },
      { status: 500 }
    );
  }
}
