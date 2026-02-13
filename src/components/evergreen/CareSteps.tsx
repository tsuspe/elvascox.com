type Step = { n: string; title: string; text: string };

export default function CareSteps({
  steps,
  noteTitle,
  noteText,
}: {
  steps: Step[];
  noteTitle?: string;
  noteText?: string;
}) {
  return (
    <div className="space-y-4">
      {steps.map((s) => (
        <div
          key={s.n}
          className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Paso {s.n}
              </div>
              <div className="mt-1 text-lg font-semibold text-zinc-100">
                {s.title}
              </div>
            </div>
            <div className="text-zinc-700 text-3xl font-semibold">{s.n}</div>
          </div>
          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{s.text}</p>
        </div>
      ))}

      {noteTitle && noteText ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="text-sm font-semibold text-zinc-100">{noteTitle}</div>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{noteText}</p>
        </div>
      ) : null}
    </div>
  );
}
