import type { ReactNode } from "react";

export default function SectionTitle({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="space-y-4">
      <h1 className="max-w-[14ch] text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
        {title}
      </h1>

      {subtitle ? (
        <div className="max-w-2xl text-zinc-400 text-base sm:text-lg">
          {subtitle}
        </div>
      ) : null}
    </header>
  );
}
