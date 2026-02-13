// src/components/HeaderSearchClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function normalizeQuery(q: string) {
  return q.replace(/\s+/g, " ").trim();
}

export default function HeaderSearchClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const isValid = useMemo(() => normalizeQuery(q).length >= 2, [q]);

  function go() {
    const query = normalizeQuery(q);
    if (query.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón para móvil / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-600"
        aria-expanded={open}
        aria-label="Abrir búsqueda"
        title="Buscar"
      >
        Buscar
      </button>

      {/* Input compacto (aparece al abrir) */}
      {open ? (
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
              if (e.key === "Escape") setOpen(false);
            }}
            autoFocus
            placeholder="blackout, acid, film..."
            className="w-44 sm:w-64 rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
          />
          <button
            type="button"
            onClick={go}
            disabled={!isValid}
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-40"
            title="Buscar"
          >
            ↵
          </button>
        </div>
      ) : null}
    </div>
  );
}
