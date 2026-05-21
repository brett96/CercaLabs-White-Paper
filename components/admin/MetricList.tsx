import type { ReactNode } from "react";

export function MetricList({
  items,
  emptyLabel = "No data yet.",
  formatLabel,
}: {
  items: { label: string; sub?: string; count: number }[];
  emptyLabel?: string;
  formatLabel?: (label: string, sub?: string) => ReactNode;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={`${item.label}-${item.sub ?? ""}`} className="flex justify-between gap-4">
          <span className="truncate text-slate-600">
            {formatLabel ? formatLabel(item.label, item.sub) : item.label}
            {item.sub && !formatLabel ? (
              <span className="text-slate-400"> · {item.sub}</span>
            ) : null}
          </span>
          <span className="shrink-0 font-semibold tabular-nums">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
