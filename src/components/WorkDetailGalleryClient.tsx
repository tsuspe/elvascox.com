// src/components/WorkDetailGalleryClient.tsx
"use client";

import WorkGallery from "@/components/WorkGallery";

const OPEN_EVENT = "workgallery:open";

export default function WorkDetailGalleryClient({
  title,
  coverUrl,
  media,
}: {
  title: string;
  coverUrl: string | null;
  media: any[];
}) {
  return (
    <div className="space-y-4">
      {coverUrl ? (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(OPEN_EVENT, { detail: { url: coverUrl } })
            );
          }}
          className="block w-full text-left group"
          aria-label="Abrir cover"
        >
          <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden glitch-frame glitch-bar">
            <div className="relative aspect-[16/10] bg-zinc-950">
              <img
                src={coverUrl}
                alt={title}
                className="h-full w-full object-cover"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute inset-0 glitch-hover" />

              <div className="absolute left-3 bottom-3 text-xs text-zinc-300/90">
                <span className="text-zinc-500">abrir cover</span>
                <span className="text-red-500"> ✖</span>
              </div>
            </div>

            <div className="p-3 text-xs text-zinc-500">
              click para ampliar <span className="text-red-500">✖</span>
            </div>
          </div>
        </button>
      ) : null}

      <WorkGallery media={media} title={title} hideCoverInGallery />
    </div>
  );
}
