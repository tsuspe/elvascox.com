//src/components/MediaRender.tsx
import Image from "next/image";

type MediaItem = {
  kind: string;
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type Props = {
  media: MediaItem;
  className?: string;
  priority?: boolean;
  frame?: boolean;

  fit?: "cover" | "contain";
};

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toYouTubeEmbed(url: string) {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

// ✅ fallback: si no es URL válida o no queremos depender de next/image en ciertos hosts
function canUseNextImage(url: string) {
  try {
    const u = new URL(url);
    // aquí podrías ampliar allowlist si quieres
    return u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export default function MediaRenderer({
  media,
  className,
  priority,
  frame = true,
  fit = "cover",
}: Props) {
  const kind = (media.kind || "").toLowerCase();
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  // EMBED
  if (kind === "embed") {
    const src = isYouTube(media.url) ? toYouTubeEmbed(media.url) : media.url;

    if (!frame) {
      return (
        <div className={className}>
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={src}
              title={media.alt ?? "embed"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="relative w-full overflow-hidden rounded-xl border border-zinc-800">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={src}
              title={media.alt ?? "embed"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }

  // VIDEO
  if (kind === "video") {
    if (!frame) {
      return (
        <div className={className}>
          <video className={`w-full h-full ${fitClass}`} controls playsInline>
            <source src={media.url} />
          </video>
        </div>
      );
    }

    return (
      <div className={className}>
        <video className="w-full rounded-xl border border-zinc-800" controls playsInline>
          <source src={media.url} />
        </video>
      </div>
    );
  }

  // IMAGE
  const w = media.width ?? 1400;
  const h = media.height ?? 900;

  // ✅ si el host no está en next.config, usamos <img> y no peta
  if (!canUseNextImage(media.url)) {
    return (
      <div className={className}>
        <img
          src={media.url}
          alt={media.alt ?? ""}
          loading={priority ? "eager" : "lazy"}
          className={`h-full w-full ${fitClass}`}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src={media.url}
        alt={media.alt ?? ""}
        width={w}
        height={h}
        priority={priority}
        className={`h-full w-full ${fitClass}`}
      />
    </div>
  );
}
