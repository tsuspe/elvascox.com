import Link from "next/link";
import type { ReactNode } from "react";

export default function CTABox({
  title,
  desc,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  aside,
}: {
  title: string;
  desc?: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
        <div className="text-2xl font-semibold">{title}</div>
        {desc ? <div className="mt-2 text-zinc-400 max-w-2xl">{desc}</div> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={primaryHref}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="rounded-2xl border border-zinc-800 bg-black/30 p-6">
        {aside}
      </aside>
    </div>
  );
}
