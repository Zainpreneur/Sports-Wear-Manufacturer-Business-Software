import { cx } from "@/lib/format";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={cx(
          "mt-2 text-2xl font-semibold",
          tone === "warning" && "text-amber-600",
          tone === "danger" && "text-rose-600",
          tone === "default" && "text-slate-900"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
