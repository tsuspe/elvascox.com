import MediaRenderer from "@/components/MediaRenderer";
import type { ReactNode } from "react";

type Props = {
  reverse?: boolean;
  media: { kind: "image" | "video"; url: string; alt?: string | null };
  children: ReactNode;
};

export default function EditorialBlock({ reverse, media, children }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
      <div
        className={[
          "relative overflow-hidden rounded-2xl border border-zinc-800 bg-black",
          reverse ? "lg:order-2" : "",
        ].join(" ")}
      >
        <div className="aspect-[4/3]">
          <MediaRenderer media={media as any} className="h-full w-full" />
        </div>
      </div>

      <div
        className={[
          "space-y-4 text-zinc-300 leading-relaxed",
          reverse ? "lg:order-1" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
