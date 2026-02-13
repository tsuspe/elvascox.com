//src/components/evergreen/TattooRevealSlider.tsx
"use client";

import { useRef, useState } from "react";

type Props = {
  topImage: string;      // textura
  bottomImage: string;   // tattoo
  altTop?: string;
  altBottom?: string;
};

export default function TattooRevealSlider({
  topImage,
  bottomImage,
  altTop,
  altBottom,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50); // %

  function updatePos(clientX: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setPos(pct);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 select-none"
      onMouseMove={(e) => updatePos(e.clientX)}
      onTouchMove={(e) => updatePos(e.touches[0].clientX)}
    >
      {/* Imagen inferior (tattoo) */}
      <img
        src={bottomImage}
        alt={altBottom ?? ""}
        className="block h-full w-full object-cover"
      />

      {/* Imagen superior (textura) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        <img
          src={topImage}
          alt={altTop ?? ""}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Línea del slider */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${pos}%` }}
      >
        <div className="h-full w-px bg-red-500" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-red-500 p-2 shadow-lg">
          <div className="h-2 w-2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
