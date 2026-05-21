"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TRAFFIC_RANGES, type TrafficRangeId } from "@/lib/analytics-range";
import { cn } from "@/lib/utils";

export function TrafficRangeFilters() {
  const searchParams = useSearchParams();
  const current = (searchParams.get("range") as TrafficRangeId) || "30d";

  return (
    <div className="flex flex-wrap gap-2">
      {TRAFFIC_RANGES.map((preset) => (
        <Link
          key={preset.id}
          href={`/admin/traffic?range=${preset.id}`}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            current === preset.id
              ? "border-slate-800 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          {preset.label}
        </Link>
      ))}
    </div>
  );
}
