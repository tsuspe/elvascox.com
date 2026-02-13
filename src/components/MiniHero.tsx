import Link from "next/link";

type Breadcrumb = { href: string; label: string };
type CTA = { href: string; label: string; variant?: "solid" | "ghost" };

type Props = {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: string;
  quote?: string;
  crumbs?: Breadcrumb[];
  ctas?: CTA[];
};

export default function MiniHero({
  kicker,
  title,
  subtitle,
  quote,
  crumbs = [],
  ctas = [],
}: Props) {
  return (
    <header className="space-y-3">
      {crumbs.length ? (
        <nav className="text-xs text-zinc-500">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              <Link href={c.href} className="hover:text-zinc-300 transition">
                {c.label}
              </Link>
              {i < crumbs.length - 1 ? <span> / </span> : null}
            </span>
          ))}
        </nav>
      ) : null}

      {kicker ? (
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          {kicker}
        </div>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

      {subtitle ? (
        <p className="text-zinc-400 max-w-2xl">{subtitle}</p>
      ) : null}

      {quote ? (
        <div className="max-w-2xl rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
          <span className="text-zinc-500">“</span>
          {quote}
          <span className="text-zinc-500">”</span>
        </div>
      ) : null}

      {ctas.length ? (
        <div className="flex flex-wrap gap-3 pt-1">
          {ctas.map((c) => {
            const solid = c.variant === "solid";
            return (
              <Link
                key={c.href}
                href={c.href}
                className={
                  solid
                    ? "rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
                    : "rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition"
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}
