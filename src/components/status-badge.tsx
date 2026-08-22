import { STATUS_TONE } from "@/lib/constants";
import { cx } from "@/lib/format";

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-100 text-sky-700",
  warning: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  const text = label ?? status.replaceAll("_", " ");
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        TONE_CLASSES[tone]
      )}
    >
      {text.toLowerCase()}
    </span>
  );
}
