import MediaRenderer from "@/components/MediaRenderer";
import type { ReactNode } from "react";

type HeroMediaProps = {
  media: { kind: "image" | "video"; url: string; alt?: string | null };
  kicker?: string;
    manifestoTitle: React.ReactNode;
  manifestoText?: string;
  footer?: ReactNode;
};

export default function HeroMedia({
  media,
  kicker = "Manifiesto",
  manifestoTitle,
  manifestoText,
  footer,
}: HeroMediaProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black">
      <div className="relative aspect-[16/9]">
        <MediaRenderer media={media as any} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            {kicker}
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-semibold leading-snug">
            {manifestoTitle}
          </p>
          {manifestoText ? (
            <p className="mt-3 text-sm text-zinc-300/90 max-w-2xl">
              {manifestoText}
            </p>
          ) : null}
          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
