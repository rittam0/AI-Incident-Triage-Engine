const colors: Record<string, string> = {
  OPEN: "border-amber-300 bg-amber-50 text-amber-800",
  TRIAGED: "border-sky-300 bg-sky-50 text-sky-800",
  RESOLVED: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        colors[value] ?? "border-slate-300 bg-slate-50 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}
