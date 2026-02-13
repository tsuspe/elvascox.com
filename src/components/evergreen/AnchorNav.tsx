// src/components/evergreen/AnchorNav.tsx
"use client";

import * as React from "react";

/**
 * AnchorNav (sticky)
 * - Navegación interna por anchors (#seccion).
 * - Sticky con offset (top) para no chocar con el nav global.
 * - Resalta la sección activa.
 *
 * Fix: en páginas largas, usar `intersectionRatio` puede dejar “pegada”
 * la sección anterior (p.ej. #needles) aunque ya estés en #experiments.
 * Aquí decidimos el activo por cercanía al “punto de lectura” (offset).
 */

type Item = { href: string; label: string };

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function AnchorNav({ items }: { items: Item[] }) {
  const [active, setActive] = React.useState<string>(items[0]?.href ?? "#");

  // Ajusta si tu header global cambia de alto.
  // 64 (header) + ~56 (pills nav) ≈ 120
  const ACTIVE_OFFSET_PX = 120;

  React.useEffect(() => {
    const ids = items
      .map((it) => it.href)
      .filter((h) => h.startsWith("#"))
      .map((h) => h.slice(1));

    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Secciones que están “tocando” el área visible
        const inView = entries.filter((e) => e.isIntersecting) as Array<
          IntersectionObserverEntry & { target: HTMLElement }
        >;

        if (!inView.length) return;

        // Elegimos la sección cuyo top está más cerca del offset (punto de lectura).
        // (top - offset) más cercano a 0, pero preferimos las que ya han pasado el offset
        // o están muy cerca de entrar.
        const scored = inView
          .map((e) => {
            const top = e.boundingClientRect.top; // relativo al viewport
            const d = top - ACTIVE_OFFSET_PX;
            return { id: e.target.id, d };
          })
          .sort((a, b) => {
            // Preferimos la que esté "más cerca" del offset
            const ad = Math.abs(a.d);
            const bd = Math.abs(b.d);
            return ad - bd;
          });

        const best = scored[0];
        if (!best?.id) return;

        setActive(`#${best.id}`);
      },
      {
        // Creamos una “zona activa” cerca del top (debajo del sticky).
        // El bottom -75% evita que se activen cosas por estar al fondo.
        rootMargin: `-${ACTIVE_OFFSET_PX}px 0px -75% 0px`,
        threshold: [0, 0.1],
      }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  function onClick(href: string) {
    // Marca activo instantáneo al click (UX mejor, evita “lag” del observer).
    setActive(href);
  }

  return (
    <nav
      className={cn(
        "sticky top-16 z-30",
        "-mx-5 border-b border-zinc-900 bg-black/75 px-5 py-3 backdrop-blur"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
        {items.map((it) => {
          const isActive = active === it.href;

          return (
            <a
              key={it.href}
              href={it.href}
              onClick={() => onClick(it.href)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                isActive
                  ? "border-red-500/50 bg-red-500/10 text-zinc-100"
                  : "border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
