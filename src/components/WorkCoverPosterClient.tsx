// src/components/WorkCoverPosterClient.tsx
"use client";

import MediaRenderer from "@/components/MediaRenderer";

const OPEN_EVENT = "workgallery:open";

export default function WorkCoverPosterClient({
  cover,
  title,
  dateLabel,
}: {
  cover: any | null;
  title: string;
  dateLabel: string | null;
}) {
  if (!cover) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden">
        <div className="relative aspect-[4/5] bg-gradient-to-br from-zinc-950 to-black" />
        <div className="p-4 text-xs text-zinc-500 flex items-center justify-between">
          <span>{dateLabel ? dateLabel : "archivo"}</span>
          <span className="text-red-500">✖</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { url: cover.url } }));
      }}
      className="block w-full text-left"
      aria-label="Abrir cover"
    >
      <div className="rounded-2xl border border-zinc-800 bg-black/30 overflow-hidden cursor-pointer">
        <div className="relative aspect-[4/5] bg-zinc-950">
          <MediaRenderer media={cover as any} className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 glitch-hover" />

          <div className="absolute left-3 bottom-3 text-xs text-zinc-300/90">
            <span className="text-zinc-500">abrir cover</span>
            <span className="text-red-500"> ✖</span>
          </div>
        </div>

        <div className="p-4 text-xs text-zinc-500 flex items-center justify-between">
          <span>{dateLabel ? dateLabel : "archivo"}</span>
          <span className="text-red-500">✖</span>
        </div>
      </div>
    </button>
  );
}
