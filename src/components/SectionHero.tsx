import Link from "next/link";

type CTA = { href: string; label: string; variant?: "solid" | "ghost" };

type Props = {
  kicker?: string;           // línea pequeña arriba
  title: React.ReactNode;    // admite spans con rojo
  subtitle?: string;         // 1-2 líneas
  quote?: string;            // frase corta (tu bio)
  ctas?: CTA[];
};

export default function SectionHero({
  kicker,
  title,
  subtitle,
  quote,
  ctas = [],
}: Props) {
  return (
    <header className="space-y-4">
      {kicker ? (
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          {kicker}
        </div>
      ) : null}

      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>

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
