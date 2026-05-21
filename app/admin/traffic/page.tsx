import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { trafficAnalyticsForRange } from "@/lib/analytics";
import {
  parseTrafficRange,
  rangeLabel,
  type TrafficRangeId,
} from "@/lib/analytics-range";
import { decodeGeo, formatPtDateTime, formatRelative } from "@/lib/format-date";
import { TrafficRangeFilters } from "@/components/admin/TrafficRangeFilters";
import { MetricList } from "@/components/admin/MetricList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatLocation(
  city?: string | null,
  region?: string | null,
  country?: string | null
) {
  const parts = [decodeGeo(city), decodeGeo(region), country].filter(
    Boolean
  ) as string[];
  return parts.length ? parts.join(", ") : "—";
}

export default async function AdminTrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  if (!db) {
    return <p className="text-slate-600">Database not configured.</p>;
  }

  const params = await searchParams;
  const range: TrafficRangeId = parseTrafficRange(params.range);
  const data = await trafficAnalyticsForRange(db, range);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">
            Visits by IP, location, browser, and device · {rangeLabel(range)}
          </p>
        </div>
        <Suspense fallback={<div className="h-9" />}>
          <TrafficRangeFilters />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique visitors</CardDescription>
            <CardTitle className="text-3xl">{data.visitors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pageviews</CardDescription>
            <CardTitle className="text-3xl">{data.pageviews}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Countries</CardTitle>
            <CardDescription>By pageviews</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.countries.map((r) => ({
                label: r.country ?? "Unknown",
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cities</CardTitle>
            <CardDescription>By pageviews</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.cities.map((r) => ({
                label: decodeGeo(r.city) ?? "Unknown",
                sub: [decodeGeo(r.region), r.country].filter(Boolean).join(", "),
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Browsers</CardTitle>
            <CardDescription>By pageviews</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.browsers.map((r) => ({
                label: r.browser ?? "Unknown",
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device types</CardTitle>
            <CardDescription>By pageviews</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.devices.map((r) => ({
                label: (r.deviceType ?? "unknown").replace(/^./, (c) =>
                  c.toUpperCase()
                ),
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visits by IP</CardTitle>
          <CardDescription>
            Client IPs with inferred location from Vercel edge headers
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {data.ips.length === 0 ? (
            <p className="px-6 text-sm text-slate-400">No IP data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead>Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.ips.map((row) => (
                  <TableRow key={`${row.ip}-${row.city}-${row.country}`}>
                    <TableCell className="font-mono text-xs text-slate-700">
                      {row.ip ?? "—"}
                    </TableCell>
                    <TableCell>{row.country ?? "—"}</TableCell>
                    <TableCell>
                      {formatLocation(row.city, row.region, null)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {row.visits}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatRelative(row.lastSeen)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top paths</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.paths.map((r) => ({
                label: r.path || "/",
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricList
              items={data.referrers.map((r) => ({
                label: r.referrer || "(direct)",
                count: Number(r.n),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent visits</CardTitle>
          <CardDescription>
            Latest pageviews with IP, geo, browser, and device (times PT)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {data.visits.length === 0 ? (
            <p className="px-6 text-sm text-slate-400">No visits yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.visits.map((v, i) => (
                  <TableRow key={`${v.occurredAt?.toISOString()}-${i}`}>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {formatPtDateTime(v.occurredAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {v.ip ?? "—"}
                    </TableCell>
                    <TableCell>{v.country ?? "—"}</TableCell>
                    <TableCell>
                      {formatLocation(v.city, v.region, null)}
                    </TableCell>
                    <TableCell>{v.browser ?? "—"}</TableCell>
                    <TableCell className="capitalize text-slate-600">
                      {v.deviceType ?? "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[12rem] truncate text-slate-700"
                      title={v.path ?? ""}
                    >
                      {v.path ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
