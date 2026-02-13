// components/WorkCard.tsx
import MediaRenderer from "@/components/MediaRenderer";
import Link from "next/link";

type Media = {
  id: string;
  kind: string;
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  order: number;
  isCover: boolean;
};

type Tag = { tag: { name: string } };

type Work = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  type: string;
  status: string;
  publishedAt?: Date | null;
  media: Media[];
  tags: Tag[];
};

function pickCover(media: Media[]) {
  const cover = media.find((m) => m.isCover);
  return cover ?? media[0] ?? null;
}

export default function WorkCard({ work }: { work: Work }) {
  const cover = pickCover(work.media);
  const tags = work.tags?.slice(0, 3) ?? [];

  return (
    <Link
      href={`/work/${work.slug}`}
      className="group rounded-2xl border border-zinc-900 bg-black/40 overflow-hidden hover:border-zinc-800 transition"
    >
      <div className="relative aspect-[16/10] bg-black">
        {cover ? (
          <>
            <MediaRenderer media={cover} className="absolute inset-0" />
            <div className="absolute inset-0 ring-1 ring-red-500/10 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
            sin media
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          {work.type}
          {work.publishedAt ? (
            <span className="text-zinc-600"> · {new Date(work.publishedAt).toLocaleDateString()}</span>
          ) : null}
        </div>

        <div className="font-semibold text-zinc-200 group-hover:text-zinc-100 transition">
          {work.title}
        </div>

        {work.excerpt ? (
          <div className="text-sm text-zinc-400 line-clamp-2">{work.excerpt}</div>
        ) : null}

        {tags.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((t) => (
              <span
                key={t.tag.name}
                className="text-xs rounded-full border border-zinc-800 px-2 py-0.5 text-zinc-400"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
