import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import {
  distinctVisitors,
  distinctVisitorsToday,
  funnelCounts,
  pageviewsByDay,
  recentWhitepaperLeads,
  topPaths,
  topReferrers,
  whitepaperLeadsCountSince,
} from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  if (!db) {
    return (
      <p className="text-slate-600">
        Connect <code className="rounded bg-slate-100 px-1">DATABASE_URL</code>{" "}
        to see analytics.
      </p>
    );
  }

  const [vToday, v7, v30, leads30, funnel, series, referrers, paths, leads] =
    await Promise.all([
      distinctVisitorsToday(db),
      distinctVisitors(db, 7),
      distinctVisitors(db, 30),
      whitepaperLeadsCountSince(db, 30),
      funnelCounts(db, 30),
      pageviewsByDay(db, 30),
      topReferrers(db, 30, 6),
      topPaths(db, 30, 8),
      recentWhitepaperLeads(db, 8),
    ]);

  const conv =
    funnel.pageview > 0
      ? ((funnel.form_submit / funnel.pageview) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitors today</CardDescription>
            <CardTitle className="text-3xl">{vToday}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitors (7d)</CardDescription>
            <CardTitle className="text-3xl">{v7}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitors (30d)</CardDescription>
            <CardTitle className="text-3xl">{v30}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>White paper leads (30d)</CardDescription>
            <CardTitle className="text-3xl">{leads30}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel (30 days)</CardTitle>
          <CardDescription>
            Pageviews → form starts → submissions · conversion {conv}%
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <div>Pageviews: {funnel.pageview}</div>
          <div>Form starts: {funnel.form_start}</div>
          <div>Submissions: {funnel.form_submit}</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {referrers.map((r, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="truncate text-slate-600">
                  {r.referrer || "(direct)"}
                </span>
                <span className="font-medium">{r.n}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {paths.map((p, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="truncate text-slate-600">{p.path || "/"}</span>
                <span className="font-medium">{p.n}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">White paper PDF</CardTitle>
          <Link
            href="/admin/whitepaper"
            className="text-sm text-teal-700 hover:underline"
          >
            Manage upload
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Upload the visitor download PDF to Firebase Storage from the PDF admin
            page. Downloads are served via signed URLs after form submission.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent leads</CardTitle>
          <Link href="/admin/leads" className="text-sm text-teal-700 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Organization</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      {l.firstName} {l.lastName}
                    </td>
                    <td className="py-2 pr-4">{l.email}</td>
                    <td className="py-2 pr-4">{l.organization}</td>
                    <td className="py-2 text-slate-500">
                      {l.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pageviews by day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-slate-600">
          {series.slice(-14).map((d) => (
            <div key={d.day} className="flex justify-between">
              <span>{d.day}</span>
              <span>{d.views}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
