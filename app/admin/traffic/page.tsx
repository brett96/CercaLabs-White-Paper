import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { topPaths, topReferrers } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminTrafficPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  if (!db) {
    return <p className="text-slate-600">Database not configured.</p>;
  }

  const [referrers, paths] = await Promise.all([
    topReferrers(db, 30, 20),
    topPaths(db, 30, 20),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Traffic (30 days)</h1>
      <p className="text-sm text-slate-600">
        Custom events stored in Postgres. Vercel Analytics runs in parallel on
        all pages. Add{" "}
        <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_GA_MEASUREMENT_ID</code>{" "}
        for Google Analytics 4.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {referrers.map((r, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="truncate text-slate-600">
                  {r.referrer || "(direct / none)"}
                </span>
                <span className="shrink-0 font-medium">{r.n}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Landing paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {paths.map((p, i) => (
              <div key={i} className="flex justify-between gap-4">
                <span className="truncate text-slate-600">{p.path || "/"}</span>
                <span className="shrink-0 font-medium">{p.n}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
