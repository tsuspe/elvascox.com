// src/components/WorkGallery.tsx
"use client";

import Image from "next/image";
import * as React from "react";

type MediaItem = {
  id?: string;
  kind: string;
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  isCover?: boolean | null;
  order?: number | null;
};

type Props = {
  media: MediaItem[];
  title?: string;

  /** Si quieres que el cover NO aparezca en la galería (porque ya lo muestras en el hero) */
  hideCoverInGallery?: boolean;
};

function isYouTube(url: string) {
  const u = (url ?? "").toLowerCase();
  return u.includes("youtu.be/") || u.includes("youtube.com");
}

function toYouTubeEmbed(url: string) {
  try {
    const raw = String(url);

    // youtu.be/ID
    if (raw.includes("youtu.be/")) {
      const id = raw.split("youtu.be/")[1]?.split("?")[0]?.trim();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : raw;
    }

    // youtube.com/watch?v=ID
    const u = new URL(raw);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : raw;
  } catch {
    return String(url);
  }
}

function isImage(m: MediaItem) {
  const k = (m.kind ?? "").toLowerCase();
  // Si viene tipado y NO es image, fuera.
  if (k && k !== "image") return false;

  const u = (m.url ?? "").toLowerCase().trim();

  // Filtra claramente vídeos/embeds.
  if (u.includes("youtube.com") || u.includes("youtu.be")) return false;
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov")) return false;

  // Si llega aquí lo tratamos como imagen “pintable”.
  return true;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type OpenEventDetail = { url: string };
const OPEN_EVENT = "workgallery:open";

export default function WorkGallery({ media, title, hideCoverInGallery }: Props) {
  // ✅ viewerItems: lista completa, ordenada y con cover primero (si existe)
  const viewerItems = React.useMemo(() => {
    const sorted = [...(media ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const coverIdx = sorted.findIndex((m) => m.isCover);
    if (coverIdx > 0) {
      const [c] = sorted.splice(coverIdx, 1);
      sorted.unshift(c);
    }
    return sorted;
  }, [media]);

  // ✅ imageItems: SOLO imágenes (lo que realmente se pinta con next/image)
  // Si hideCoverInGallery => quitamos cover SOLO aquí
  const imageItems = React.useMemo(() => {
    const imgs = viewerItems.filter(isImage);
    if (!hideCoverInGallery) return imgs;
    return imgs.filter((m) => !m.isCover);
  }, [viewerItems, hideCoverInGallery]);

  // ✅ embed/link items: TODO lo que NO es imagen (youtube, soundcloud, bandcamp, etc.)
  const embedItems = React.useMemo(() => {
    return viewerItems.filter((m) => !isImage(m) && !!m.url);
  }, [viewerItems]);

  const youtubeItems = React.useMemo(() => {
    return embedItems.filter((m) => isYouTube(m.url));
  }, [embedItems]);

  // Índices de imágenes dentro de viewerItems (para navegar en lightbox)
  const imageIndexes = React.useMemo(() => {
    const idxs: number[] = [];
    viewerItems.forEach((m, i) => {
      if (isImage(m)) idxs.push(i);
    });
    return idxs;
  }, [viewerItems]);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0); // índice dentro de viewerItems
  const activeMedia = viewerItems[active];

  function close() {
    setOpen(false);
  }

  // Solo abrimos si el url corresponde a una imagen (evita youtu.be etc)
  function openByUrl(url: string) {
    const idx = viewerItems.findIndex((m) => m.url === url);
    if (idx === -1) return;
    if (!isImage(viewerItems[idx])) return; // ✅ guardrail
    setActive(idx);
    setOpen(true);
  }

  // grid index -> abre por url (porque grid puede ser lista filtrada)
  function openAtGrid(i: number) {
    const m = imageItems[i];
    if (!m) return;
    openByUrl(m.url);
  }

  function next() {
    if (!imageIndexes.length) return;
    const currentPos = imageIndexes.indexOf(active);
    const nextPos = (currentPos + 1) % imageIndexes.length;
    setActive(imageIndexes[nextPos]);
  }

  function prev() {
    if (!imageIndexes.length) return;
    const currentPos = imageIndexes.indexOf(active);
    const prevPos = (currentPos - 1 + imageIndexes.length) % imageIndexes.length;
    setActive(imageIndexes[prevPos]);
  }

  // ✅ Apertura externa (desde poster lateral, etc.) vía CustomEvent
  React.useEffect(() => {
    function onOpen(ev: Event) {
      const ce = ev as CustomEvent<OpenEventDetail>;
      const url = ce?.detail?.url;
      if (!url) return;
      openByUrl(url);
    }

    window.addEventListener(OPEN_EVENT, onOpen as EventListener);
    return () => window.removeEventListener(OPEN_EVENT, onOpen as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerItems]);

  // Teclado
  React.useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, imageIndexes.length]);

  // Bloquear scroll fondo
  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!viewerItems.length) return null;

  const hasGrid = imageItems.length > 0;
  const main = hasGrid ? imageItems[0] : null;
  const thumbs = hasGrid ? imageItems.slice(0, 10) : [];

  const mainW = (main?.width ?? 1400) as number;
  const mainH = (main?.height ?? 900) as number;

  // contador “bonito” (respecto al set de imágenes)
  const currentIdx = clamp(imageIndexes.indexOf(active) + 1, 1, imageIndexes.length || 1);
  const totalIdx = imageIndexes.length || 1;

  return (
    <div className="space-y-3">
      {/* MAIN (si existe grid) */}
      {main ? (
        <button
          type="button"
          onClick={() => openAtGrid(0)}
          className="block w-full text-left group"
          aria-label="Abrir imagen"
        >
          <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black glitch-frame glitch-bar">
            <div className="aspect-[14/9]">
              <Image
                src={main.url}
                alt={main.alt ?? title ?? ""}
                width={mainW}
                height={mainH}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen gallery-noise" />
            <div className="pointer-events-none absolute inset-0 scanline" />
            <div className="pointer-events-none absolute inset-0 glitch-hover" />

            <div className="absolute left-3 bottom-3 text-xs text-zinc-300/90">
              <span className="text-zinc-500">abrir</span>
              <span className="text-red-500"> ✖</span>
            </div>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl border border-zinc-900 bg-black/20 p-4 text-sm text-zinc-500">
          No hay galería de imágenes (o solo hay embeds/vídeo).
        </div>
      )}

      {/* THUMBS */}
      {thumbs.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {thumbs.map((m, i) => {
            const w = m.width ?? 400;
            const h = m.height ?? 300;
            const isMain = i === 0;

            return (
              <button
                key={m.id ?? `${m.url}-${i}`}
                type="button"
                onClick={() => openAtGrid(i)}
                className={[
                  "group relative h-14 w-14 overflow-hidden rounded-lg border bg-black transition",
                  isMain ? "border-red-500/70" : "border-zinc-800 hover:border-zinc-600",
                ].join(" ")}
                aria-label={`Abrir media ${i + 1}`}
              >
                <Image
                  src={m.url}
                  alt={m.alt ?? ""}
                  width={w}
                  height={h}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 glitch-hover" />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* EMBEDS / LINKS (YouTube, etc.) */}
      {embedItems.length ? (
        <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 space-y-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Media links</div>

          <div className="flex flex-wrap gap-2">
            {embedItems.map((m, i) => (
              <a
                key={m.id ?? `${m.url}-${i}`}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-600 transition"
                title={m.alt ?? ""}
              >
                {isYouTube(m.url) ? "YouTube" : "Abrir enlace"} →
              </a>
            ))}
          </div>

          {/* Embed directo (opcional) */}
          {youtubeItems.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {youtubeItems.slice(0, 2).map((m, i) => (
                <div
                  key={m.id ?? `${m.url}-yt-${i}`}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-black"
                >
                  <div className="aspect-video bg-black">
                    <iframe
                      className="h-full w-full"
                      src={toYouTubeEmbed(m.url)}
                      title={m.alt ?? title ?? "YouTube"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* LIGHTBOX (solo imágenes) */}
      {open && activeMedia && isImage(activeMedia) ? (
        <div
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen gallery-noise" />
          <div className="pointer-events-none absolute inset-0 gallery-flicker" />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  <span className="uppercase tracking-wide text-zinc-500">archivo</span>
                  <span className="text-zinc-700"> · </span>
                  {title ? <span className="text-zinc-200">{title}</span> : null}
                  <span className="text-zinc-700"> · </span>
                  <span className="text-zinc-300">
                    {currentIdx}/{totalIdx}
                  </span>
                  <span className="text-red-500"> ✖</span>
                </div>

                <div className="flex items-center gap-2">
                  {imageIndexes.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={prev}
                        className="rounded-lg border border-zinc-700 bg-black/30 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500 transition"
                        aria-label="Anterior"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        className="rounded-lg border border-zinc-700 bg-black/30 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500 transition"
                        aria-label="Siguiente"
                      >
                        →
                      </button>
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500 transition"
                  >
                    Cerrar (ESC)
                  </button>
                </div>
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black gallery-pop glitch-frame glitch-bar">
                <div className="relative h-[74vh] w-full">
                  <Image
                    src={activeMedia.url}
                    alt={activeMedia.alt ?? title ?? ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 scanline" />
                <div className="pointer-events-none absolute inset-0 gallery-red-glow" />
              </div>

              {imageIndexes.length > 1 ? (
                <div className="mt-3 text-center text-xs text-zinc-500">
                  Usa ← → para navegar. Clic fuera para cerrar.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .gallery-noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        .gallery-flicker {
          animation: galleryFlicker 2.2s infinite steps(1, end);
        }
        @keyframes galleryFlicker {
          0%,
          84%,
          100% {
            opacity: 0;
          }
          85% {
            opacity: 0.08;
            background: rgba(239, 68, 68, 0.35);
          }
          86% {
            opacity: 0.02;
            background: rgba(239, 68, 68, 0.2);
          }
          87% {
            opacity: 0.1;
            background: rgba(239, 68, 68, 0.4);
          }
        }

        .gallery-pop {
          animation: galleryPop 180ms ease-out 1;
        }
        @keyframes galleryPop {
          0% {
            transform: translateY(6px) scale(0.985);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .gallery-red-glow {
          box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.08),
            inset 0 0 28px rgba(239, 68, 68, 0.06);
          animation: redGlow 3.4s infinite steps(1, end);
        }
        @keyframes redGlow {
          0%,
          92%,
          100% {
            opacity: 0.35;
          }
          93% {
            opacity: 0.6;
          }
          94% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
