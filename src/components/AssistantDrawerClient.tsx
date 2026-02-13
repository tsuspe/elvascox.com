// src/components/AssistantDrawerClient.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Action = { label: string; href: string };
type AssistantResponse = { reply: string; actions?: Action[] };

type Msg = { role: "user" | "assistant"; content: string; actions?: Action[] };

function safeHref(href: string) {
  if (!href) return null;
  if (href.startsWith("/")) return href;
  return null;
}

function extractPageContext() {
  const h1 =
    document.querySelector("main h1")?.textContent?.trim() ??
    document.querySelector("h1")?.textContent?.trim() ??
    "";

  const title = document.title?.trim() ?? "";
  const metaDesc =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim() ?? "";

  const canonical =
    document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href")
      ?.trim() ?? "";

  const mainText =
    document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim() ??
    "";
  const excerpt = mainText.slice(0, 1200);

  return { title, h1, metaDesc, canonical, excerpt };
}

export default function AssistantDrawerClient() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Estoy aquí. Pregúntame por esta página, por el archivo, o dime qué quieres encontrar y te llevo.",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);

  const pageContext = useMemo(() => {
    const qs = sp?.toString() ?? "";
    return { pathname, queryString: qs };
  }, [pathname, sp]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    const nextMsgs: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(nextMsgs);
    setBusy(true);

    try {
      const domCtx = typeof window !== "undefined" ? extractPageContext() : {};

      // ✅ fuente de verdad (evita pathname viejo/mezclado)
      const locationPath =
        typeof window !== "undefined" ? window.location.pathname : pathname;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })),
          page: {
            ...pageContext,
            ...domCtx,
            locationPath, // 👈 CLAVE
          },
        }),
      });

      const data = (await res.json()) as AssistantResponse;

      const safeActions =
        (data.actions ?? [])
          .map((a) => ({
            label: String(a.label ?? "").slice(0, 60),
            href: safeHref(String(a.href ?? "")) ?? "",
          }))
          .filter((a) => a.label && a.href) ?? [];

      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Ok.", actions: safeActions },
      ]);
    } catch {
      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "He tenido un fallo al conectar. Si quieres, prueba otra vez o pregúntame algo más corto.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        className={[
          "fixed bottom-5 right-5 z-[999]",
          "h-11 w-11 rounded-full",
          "border border-zinc-800 bg-black/60 backdrop-blur",
          "text-zinc-200 shadow-lg",
          "transition",
          "hover:border-zinc-600 hover:text-white",
          "hover:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
          "focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-0",
          "group",
        ].join(" ")}
      >
        <span
          className={[
            "grid place-items-center text-sm font-semibold leading-none",
            open ? "bio-glitch-x" : "",
          ].join(" ")}
          {...(open ? { "data-text": "✖" } : {})}
        >
          {open ? "✖" : "IA"}
        </span>

        {!open && (
          <span
            className={[
              "absolute -top-1 -right-1",
              "h-2.5 w-2.5 rounded-full",
              "bg-red-500",
              "shadow-[0_0_0_2px_rgba(0,0,0,0.9)]",
              "opacity-80 group-hover:opacity-100",
            ].join(" ")}
          />
        )}

        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100">
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(transparent_0,rgba(239,68,68,0.08)_35%,transparent_70%)] animate-[glitchScan_220ms_ease-in-out_1]" />
        </span>
      </button>

      {open ? (
        <div className="fixed bottom-20 right-5 z-[60] w-[92vw] max-w-[420px] rounded-2xl border border-zinc-800 bg-black/90 backdrop-blur shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-900 px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Asistente
              </div>
              <div className="text-sm text-zinc-200 truncate">{pathname}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-600 transition"
            >
              Cerrar
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-[52vh] overflow-auto px-4 py-3 space-y-3"
          >
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={[
                    "inline-block max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-zinc-100 text-black"
                      : "bg-black/40 border border-zinc-800 text-zinc-200",
                  ].join(" ")}
                >
                  {m.content}
                </div>

                {m.role === "assistant" && m.actions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.actions.map((a) => (
                      <Link
                        key={a.href + a.label}
                        href={a.href}
                        className="text-xs rounded-full border border-zinc-800 bg-black/20 px-3 py-1 text-zinc-300 hover:border-zinc-600 transition"
                        onClick={() => setOpen(false)}
                      >
                        {a.label} <span className="text-red-500">→</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-900 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={busy ? "Pensando..." : "Pregunta algo…"}
                className="w-full rounded-xl border border-zinc-800 bg-black/30 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                disabled={busy}
              />
              <button
                type="button"
                onClick={send}
                disabled={busy}
                className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition disabled:opacity-50"
              >
                Enviar
              </button>
            </div>

            <div className="mt-2 text-[11px] text-zinc-600">
              Tip: “Llévame a tattoo”, “Busca blackout”, “Qué es esta página”.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
