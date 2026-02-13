// src/components/admin/WorkMediaFields.tsx
"use client";

import CloudinaryUploader from "@/components/CloudinaryUploader";
import * as React from "react";

function splitLines(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function joinLines(lines: string[]) {
  return lines.join("\n");
}

export default function WorkMediaFields({
  defaultCoverUrl = "",
  defaultCoverAlt = "",
  defaultGalleryUrls = "",
  coverRequired = true,          // ✅ NUEVO
  defaultCollapsed = false,      // ✅ NUEVO (opcional UX)
}: {
  defaultCoverUrl?: string;
  defaultCoverAlt?: string;
  defaultGalleryUrls?: string;
  coverRequired?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [coverUrl, setCoverUrl] = React.useState(defaultCoverUrl);
  const [coverAlt, setCoverAlt] = React.useState(defaultCoverAlt);

  const [galleryItems, setGalleryItems] = React.useState<string[]>(
    splitLines(defaultGalleryUrls)
  );

  const [galleryInput, setGalleryInput] = React.useState("");

  const galleryText = React.useMemo(() => joinLines(galleryItems), [galleryItems]);

  // ✅ colapsable (para Journal suele venir bien)
  const [open, setOpen] = React.useState(!defaultCollapsed);

  function addToGallery(url: string) {
    const clean = url.trim();
    if (!clean) return;
    setGalleryItems((prev) => {
      if (prev.includes(clean)) return prev;
      return [...prev, clean];
    });
  }

  function removeFromGallery(url: string) {
    setGalleryItems((prev) => prev.filter((x) => x !== url));
  }

  function updateGalleryItem(oldUrl: string, newUrl: string) {
    const clean = newUrl.trim();
    setGalleryItems((prev) =>
      prev.map((x) => (x === oldUrl ? clean : x)).filter(Boolean)
    );
  }

  function isVideo(url: string) {
    const u = url.toLowerCase();
    return u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov");
  }

  function isYouTube(url: string) {
    const u = url.toLowerCase();
    return u.includes("youtube.com") || u.includes("youtu.be");
  }

  return (
    <div className="space-y-4">
      {/* Header + toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-200">
          Media
          {!coverRequired ? (
            <span className="ml-2 inline-flex items-center rounded-full border border-zinc-700/70 bg-black/30 px-2 py-0.5 text-[12px] text-zinc-400">
              opcional (Journal)
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-zinc-800 bg-black/30 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-600 transition"
        >
          {open ? "ocultar" : "mostrar"}
        </button>
      </div>

      {!open ? (
        <div className="rounded-xl border border-zinc-900 bg-black/20 p-4 text-sm text-zinc-500">
          Media oculto.{" "}
          {coverUrl ? (
            <span className="text-zinc-400">Cover cargado.</span>
          ) : (
            <span className="text-zinc-400">Sin cover.</span>
          )}
        </div>
      ) : (
        <>
          {/* COVER */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-zinc-300">
                  Cover URL{" "}
                  {!coverRequired ? (
                    <span className="text-zinc-500">(opcional)</span>
                  ) : null}
                </label>
                <CloudinaryUploader
                  label="Subir cover"
                  onUploaded={(url) => setCoverUrl(url)}
                />
              </div>

              <input
                name="coverUrl"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
                placeholder="https://..."
                required={coverRequired}   // ✅ CLAVE
              />

              {/* preview cover */}
              {coverUrl ? (
                <div className="rounded-xl border border-zinc-800 bg-black/40 p-2">
                  <div className="text-xs text-zinc-500 mb-2">preview</div>

                  {isYouTube(coverUrl) ? (
                    <div className="text-sm text-zinc-400">
                      (cover es YouTube) — mejor usa una imagen como cover y mete el
                      YouTube en galería.
                    </div>
                  ) : isVideo(coverUrl) ? (
                    <video
                      src={coverUrl}
                      controls
                      className="w-full rounded-lg border border-zinc-800"
                    />
                  ) : (
                    <img
                      src={coverUrl}
                      alt={coverAlt || ""}
                      className="w-full rounded-lg border border-zinc-800 object-cover max-h-[240px]"
                      loading="lazy"
                    />
                  )}
                </div>
              ) : (
                !coverRequired ? (
                  <div className="text-xs text-zinc-600">
                    Journal puede ir sin cover. Si lo añades, se usará como póster/thumbnail.
                  </div>
                ) : null
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Cover ALT</label>
              <input
                name="coverAlt"
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
                placeholder="Descripción corta"
              />
              <div className="text-xs text-zinc-500">
                Tip rápido: describe lo que se ve + contexto (“Blackout en antebrazo,
                patrón orgánico, luz dura”).
              </div>
            </div>
          </div>

          {/* GALERÍA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-zinc-300">
                Galería (sube y gestiona sin sufrir)
              </label>
              <CloudinaryUploader
                label="Añadir a galería"
                onUploaded={(url) => addToGallery(url)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
                placeholder="Pega una URL y dale a añadir"
              />
              <button
                type="button"
                onClick={() => {
                  addToGallery(galleryInput);
                  setGalleryInput("");
                }}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
              >
                + añadir
              </button>
            </div>

            {galleryItems.length ? (
              <div className="rounded-xl border border-zinc-800 bg-black/20 p-3 space-y-3">
                <div className="text-xs text-zinc-500">
                  items: {galleryItems.length}
                </div>

                <div className="grid gap-3">
                  {galleryItems.map((url) => (
                    <div
                      key={url}
                      className="rounded-lg border border-zinc-800 bg-black/40 p-2"
                    >
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          value={url}
                          onChange={(e) => updateGalleryItem(url, e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFromGallery(url)}
                          className="rounded-lg border border-red-900/60 px-3 py-2 text-xs text-red-300 hover:border-red-500 transition"
                        >
                          quitar
                        </button>
                      </div>

                      <div className="mt-2">
                        {isYouTube(url) ? (
                          <div className="text-xs text-zinc-400">YouTube embed (ok)</div>
                        ) : isVideo(url) ? (
                          <div className="text-xs text-zinc-400">video (ok)</div>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="h-20 w-28 rounded-md border border-zinc-800 object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500">
                No hay galería aún. Sube algo o pega URLs.
              </div>
            )}

            <textarea
              name="galleryUrls"
              value={galleryText}
              readOnly
              className="hidden"
            />

            <textarea
              value={galleryText}
              readOnly
              className="w-full rounded-lg border border-zinc-900 bg-black/20 px-3 py-2 text-xs text-zinc-500"
              rows={4}
            />
          </div>
        </>
      )}
    </div>
  );
}
