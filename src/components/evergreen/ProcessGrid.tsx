type Step = { title: string; desc: string };

export default function ProcessGrid({ steps }: { steps: Step[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {steps.map((s) => (
        <div
          key={s.title}
          className="rounded-2xl border border-zinc-800 bg-black/30 p-5 space-y-2"
        >
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            {s.title}
          </div>
          <div className="text-zinc-200 font-semibold">{s.title}</div>
          <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
