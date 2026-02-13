// src/app/NotFoundClient.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NotFoundClient() {
  const sp = useSearchParams();
  const ok = sp.get("ok");
  const error = sp.get("error");
  const err = sp.get("err");

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 space-y-6">
      <div className="text-xs uppercase tracking-wide text-zinc-500">404</div>
      <h1 className="text-3xl font-black tracking-tight">
        No encontrado<span className="text-red-500">.</span>
      </h1>

      {(ok || error || err) ? (
        <div className="rounded-xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-300">
          {ok ? "OK" : null}
          {error ? `Error: ${error}` : null}
          {err ? `Error: ${err}` : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link href="/" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition">
          Volver a Home
        </Link>
        <Link href="/search" className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 transition">
          Buscar
        </Link>
      </div>
    </section>
  );
}
