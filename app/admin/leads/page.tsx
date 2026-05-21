import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { whitepaperLeads } from "@/lib/db/schema";

const ROLE_LABELS: Record<string, string> = {
  rcm_director: "RCM Director",
  cfo: "CFO / VP Finance",
  vp_operations: "VP Operations",
  healthcare_it: "Healthcare IT Manager",
  billing_manager: "Billing Manager",
  health_plan: "Health Plan — Program Director",
  consultant: "Consultant",
  other: "Other",
};

export default async function AdminLeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  if (!db) {
    return <p className="text-slate-600">Database not configured.</p>;
  }

  const leads = await db
    .select()
    .from(whitepaperLeads)
    .orderBy(desc(whitepaperLeads.createdAt))
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">White paper leads</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Opt-in</th>
              <th className="px-4 py-3">DNS</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {l.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {l.firstName} {l.lastName}
                </td>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3">{l.organization}</td>
                <td className="px-4 py-3">
                  {ROLE_LABELS[l.role] ?? l.role}
                </td>
                <td className="px-4 py-3">{l.consentEmail ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{l.doNotSell ? "Yes" : "No"}</td>
                <td className="px-4 py-3 max-w-[120px] truncate text-slate-500">
                  {l.referrer || l.source || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
