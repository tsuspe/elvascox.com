import type { ReactNode } from "react";

export default function SectionHeading({
  id,
  title,
  desc,
}: {
  id: string;
  title: ReactNode;
  desc?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2
        id={id}
        className="scroll-mt-24 text-2xl sm:text-3xl font-semibold tracking-tight"
      >
        {title}
      </h2>
      {desc ? <div className="text-zinc-400 max-w-3xl">{desc}</div> : null}
    </div>
  );
}
