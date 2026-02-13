"use client";

import * as React from "react";

type Item = {
  id: string; // id del bloque destino (sin #)
  label: string;
  hint?: string;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

/**
 * TimelineNav
 * - Mini timeline horizontal (tipo documental)
 * - Scroll suave a anchors dentro de "Historia"
 * - Resalta el hito activo con IntersectionObserver
 * - Modo compact: muestra lo justo, y expande info al hover/focus
 * - Línea “continúa” al final (dashed + flecha)
 */
export default function TimelineNav({
  items,
  defaultActiveId,
  sticky,
  topClassName,
  compact = true,
  continueLine = true,
}: {
  items: Item[];
  defaultActiveId?: string;
  sticky?: boolean;
  topClassName?: string;
  compact?: boolean;
  continueLine?: boolean;
}) {
  const [active, setActive] = React.useState<string>(
    defaultActiveId ?? items[0]?.id ?? ""
  );

  React.useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];

        if (!visible?.target?.id) return;
        setActive(visible.target.id);
      },
      {
        rootMargin: "-160px 0px -60% 0px",
        threshold: [0.12, 0.25, 0.5],
      }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  const pad = compact ? "px-4 py-3" : "px-5 py-4";
  const titleRow = compact ? "gap-2" : "gap-3";
  const dotSize = compact ? "h-5 w-5" : "h-6 w-6";
  const dotInner = compact ? "h-1.5 w-1.5" : "h-2 w-2";
  const labelSize = compact ? "text-xs sm:text-sm" : "text-sm";
  const trackTop = compact ? "top-2.5" : "top-3";

  return (
    <div
      className={cn(
        sticky && "sticky z-20",
        sticky && (topClassName ?? "top-28"),
        "rounded-2xl border border-zinc-800 bg-black/40 backdrop-blur"
      )}
    >
      <div className={cn(pad)}>
        <div className={cn("flex items-center", titleRow)}>
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            Timeline
          </div>
          <div className="h-px flex-1 bg-zinc-900" />
          <div className="text-[10px] text-zinc-600 hidden sm:block">
            (hover para detalles)
          </div>
        </div>

        {/* Track */}
        <div className={cn(compact ? "mt-3" : "mt-4")}>
          <div className="relative">
            {/* Línea principal */}
            <div className={cn("absolute left-0 right-0 h-px bg-zinc-800", trackTop)} />

            {/* Extensión “continúa” (dashed + flecha) */}
            {continueLine ? (
              <div className={cn("absolute h-px", trackTop, "right-0")}>
                <div className="relative">
                  {/* tramo dashed que sale un pelín del contenedor */}
                  <div className="absolute right-[-18px] top-0 w-10 border-t border-dashed border-zinc-700" />
                  {/* flecha */}
                  <div className="absolute right-[-28px] top-[-6px] text-zinc-600 text-xs">
                    →
                  </div>
                </div>
              </div>
            ) : null}

            {/* Puntos */}
            <div className="relative flex items-start justify-between gap-3">
              {items.map((it, idx) => {
                const isActive = active === it.id;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => goTo(it.id)}
                    className={cn(
                      "group flex flex-col items-center text-left outline-none",
                      "focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-0"
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {/* Dot */}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 inline-flex items-center justify-center rounded-full border transition",
                        dotSize,
                        isActive
                          ? "border-red-500/60 bg-red-500/15"
                          : "border-zinc-700 bg-black/60 group-hover:border-zinc-500"
                      )}
                    >
                      <span
                        className={cn(
                          "rounded-full transition",
                          dotInner,
                          isActive ? "bg-red-400" : "bg-zinc-500"
                        )}
                      />
                    </span>

                    {/* Label */}
                    <span
                      className={cn(
                        "mt-2 font-semibold transition text-center",
                        labelSize,
                        isActive
                          ? "text-zinc-100"
                          : "text-zinc-300 group-hover:text-zinc-100"
                      )}
                    >
                      {it.label}
                    </span>

                    {/* Hint (expand on hover/focus) */}
                    {it.hint ? (
                      <span
                        className={cn(
                          "mt-1 text-[11px] text-zinc-500 text-center overflow-hidden transition-all",
                          compact
                            ? "max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 group-focus-visible:max-h-12 group-focus-visible:opacity-100"
                            : "max-h-12 opacity-100",
                          "max-w-[18ch]"
                        )}
                      >
                        {it.hint}
                      </span>
                    ) : (
                      <span className={cn(compact ? "hidden" : "mt-1 text-xs text-transparent select-none")}>
                        .
                      </span>
                    )}

                    {/* Mini índice (solo al hover si compact) */}
                    <span
                      className={cn(
                        "mt-2 text-[10px] text-zinc-600 transition",
                        compact
                          ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                          : "opacity-100"
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* microcopy */}
        <div className={cn(compact ? "mt-3" : "mt-4", "text-xs text-zinc-500")}>
          Click para saltar de etapa. Se marca solo mientras haces scroll.
        </div>
      </div>
    </div>
  );
}
