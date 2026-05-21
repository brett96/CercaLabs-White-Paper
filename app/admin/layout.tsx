import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminNav />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
