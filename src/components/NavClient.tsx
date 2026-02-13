// src/components/NavClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Item = { href: string; label: string };

export default function NavClient({ nav }: { nav: Item[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = useMemo(() => {
    return (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(href + "/");
    };
  }, [pathname]);

  return (
    <div className="flex items-center gap-3">
      {/* Desktop */}
      <nav className="hidden md:flex gap-5 text-sm text-zinc-300">
        {nav.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={
              "hover:text-white transition " +
              (isActive(i.href) ? "text-white" : "")
            }
          >
            {i.label}
          </Link>
        ))}
      </nav>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500 transition"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        Menu
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="md:hidden absolute top-[64px] left-0 right-0 border-b border-zinc-900 bg-black/95 backdrop-blur"
        >
          <div className="mx-auto max-w-6xl px-5 py-4 grid gap-2">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className={
                  "rounded-lg border border-zinc-900 bg-black/40 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-700 transition " +
                  (isActive(i.href) ? "border-zinc-600 text-white" : "")
                }
              >
                {i.label}
              </Link>
            ))}

            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-black"
            >
              Booking
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
