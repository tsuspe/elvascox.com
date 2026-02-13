import Link from "next/link";

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-wide text-zinc-500">
      {children}
    </div>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl font-semibold tracking-tight leading-tight">
      {children}
    </h1>
  );
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-semibold scroll-mt-32 md:scroll-mt-36"
    >
      {children}
    </h2>
  );
}


export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 max-w-3xl">{children}</p>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 max-w-3xl">{children}</p>;
}

export function Divider() {
  return <div className="h-px w-full bg-zinc-900" />;
}

export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl rounded-xl border border-zinc-800 p-5 text-sm text-zinc-200">
      <span className="text-zinc-500">“</span>
      {children}
      <span className="text-zinc-500">”</span>
    </div>
  );
}

export function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export function CTA({ href, label, variant = "ghost" }: { href: string; label: string; variant?: "solid" | "ghost" }) {
  const solid = variant === "solid";
  return (
    <Link
      href={href}
      className={
        solid
          ? "rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          : "rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition"
      }
    >
      {label}
    </Link>
  );
}

export function Toc({ items }: { items: { href: string; label: string }[] }) {
  return (
    <aside className="rounded-xl border border-zinc-800 p-5">
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        Índice
      </div>
      <div className="mt-3 space-y-2 text-sm">
        {items.map((i) => (
          <a
            key={i.href}
            href={i.href}
            className="block text-zinc-300 hover:text-white transition"
          >
            {i.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
