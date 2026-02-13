type Col = { title: string; items: string[] };

export default function ChecklistColumns({
  intro,
  cols,
}: {
  intro?: string;
  cols: [Col, Col];
}) {
  return (
    <div className="space-y-4">
      {intro ? <p className="text-zinc-400 max-w-3xl">{intro}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {cols.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-zinc-800 bg-black/30 p-6"
          >
            <div className="text-sm font-semibold">{c.title}</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {c.items.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-red-500">✖</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
