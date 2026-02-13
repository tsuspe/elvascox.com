// src/components/evergreen/MosaicGallery.tsx
"use client";

import MediaRenderer from "@/components/MediaRenderer";
import * as React from "react";

/**
 * MosaicGallery
 * - Grid editorial tipo "mosaic" (como tu boceto).
 * - Por defecto: B/N (grayscale)
 * - Hover: vuelve a color (reveal)
 * - 1–2 tiles con "accent: red": overlay rojo que desaparece al hover
 * - Click: abre lightbox (visor) + navegación con teclado (Esc / ← / →)
 *
 * Importante:
 * - NO repite imágenes si le pasas menos items que slots del layout.
 * - Los slots sobrantes quedan como huecos negros elegantes (no se rompen).
 */

export type MosaicItem = {
  id: string;
  url: string;
  alt?: string | null;
  kind?: "image" | "video";
  accent?: "bw" | "red";
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function MosaicGallery({
  items,
  title = "Galería",
}: {
  items: MosaicItem[];
  title?: string;
}) {
  const safeItems = items ?? [];

  // Lightbox state
  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  const current = safeItems[idx];

  function openAt(i: number) {
    setIdx(i);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function prev() {
    setIdx((v) => (v - 1 + safeItems.length) % safeItems.length);
  }

  function next() {
    setIdx((v) => (v + 1) % safeItems.length);
  }

  // Atajos de teclado solo cuando el lightbox está abierto
  React.useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, safeItems.length]);

  /**
   * Layout fijo estilo tu dibujo.
   * Son 14 "slots" (a..j) repartidos en 4 filas.
   *
   * Si pasas 10 imágenes:
   * - se colocan 10 en los primeros 10 slots
   * - los 4 slots restantes quedan como placeholders (cuadros negros)
   */
  const layout = ["a", "b", "c", "d", "d", "c", "e", "f", "g", "h", "i", "j", "j", "j"];

  // NO repetimos: máximo = min(slots, items)
  const max = Math.min(layout.length, safeItems.length);

  // Colocación: si no hay item para un slot -> hueco "dummy"
  const placed = layout.map((slot, i) => {
    const item = i < max ? safeItems[i] : null;

    return {
      slot,
      item,
      index: i, // índice real del item en safeItems (solo tiene sentido si item != null)
      key: `${slot}-${i}`,
    };
  });

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
        <div
          className={cn(
            "grid gap-3",
            // 12 columnas y altura de filas adaptable
            "grid-cols-12 auto-rows-[110px] sm:auto-rows-[140px] lg:auto-rows-[170px]"
          )}
          style={{
            // Mapa de áreas = forma del mosaic (tu boceto)
            gridTemplateAreas: `
              "a a a a b b b b c c c c"
              "d d d d d d d d c c c c"
              "e e e f f f g g g h h h"
              "i i i i j j j j j j j j"
            `,
          }}
        >
          {placed.map(({ slot, item, index, key }) => {
            // Si no hay item: dibujamos un “hueco” elegante (sin repetir fotos)
            if (!item) {
              return (
                <div
                  key={key}
                  style={{ gridArea: slot as any }}
                  className="rounded-xl border border-zinc-900 bg-black/20"
                />
              );
            }

            const accent = item.accent ?? "bw";
            const isRed = accent === "red";

            return (
              <button
                key={key}
                type="button"
                onClick={() => openAt(index)}
                style={{ gridArea: slot as any }}
                aria-label={`Abrir ${title} ${index + 1}`}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-zinc-800 bg-black",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/40"
                )}
              >
                {/* Media en B/N por defecto. Hover -> color */}
                <div className="h-full w-full grayscale transition duration-300 ease-out group-hover:grayscale-0">
                  <MediaRenderer
                    media={{
                      kind: item.kind ?? "image",
                      url: item.url,
                      alt: item.alt ?? "",
                    } as any}
                    className="h-full w-full"
                  />
                </div>

                {/* Overlay rojo (solo en tiles marcados como red).
                    Se apaga al hover, dejando ver el color real. */}
                {isRed ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0",
                      "bg-red-500/25 mix-blend-screen",
                      "transition-opacity duration-300 ease-out",
                      "opacity-100 group-hover:opacity-0"
                    )}
                  />
                ) : null}

                {/* Micro brillo en hover para dar “vida” */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Visor */}
      {open && current ? (
        <div
          className="fixed inset-0 z-[100] bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de galería"
          onClick={close}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-800 bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] bg-black">
                <MediaRenderer
                  media={{
                    kind: current.kind ?? "image",
                    url: current.url,
                    alt: current.alt ?? "",
                  } as any}
                  className="h-full w-full"
                  fit="contain"
                />
              </div>


              <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
                <div className="text-sm text-zinc-400">
                  {title} <span className="text-zinc-600">·</span> {idx + 1}/{safeItems.length}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500 transition"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500 transition"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
