export const TRAFFIC_RANGES = [
  { id: "12h", label: "12 hours", hours: 12 },
  { id: "24h", label: "24 hours", hours: 24 },
  { id: "48h", label: "48 hours", hours: 48 },
  { id: "72h", label: "72 hours", hours: 72 },
  { id: "30d", label: "30 days", days: 30 },
] as const;

export type TrafficRangeId = (typeof TRAFFIC_RANGES)[number]["id"];

export const DEFAULT_TRAFFIC_RANGE: TrafficRangeId = "30d";

export function parseTrafficRange(
  value: string | string[] | undefined
): TrafficRangeId {
  const raw = Array.isArray(value) ? value[0] : value;
  const found = TRAFFIC_RANGES.find((r) => r.id === raw);
  return found?.id ?? DEFAULT_TRAFFIC_RANGE;
}

export function sinceForRange(range: TrafficRangeId): Date {
  const preset = TRAFFIC_RANGES.find((r) => r.id === range)!;
  if ("hours" in preset && preset.hours) {
    return new Date(Date.now() - preset.hours * 60 * 60 * 1000);
  }
  const days = preset.days ?? 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function rangeLabel(range: TrafficRangeId): string {
  return TRAFFIC_RANGES.find((r) => r.id === range)?.label ?? "30 days";
}
