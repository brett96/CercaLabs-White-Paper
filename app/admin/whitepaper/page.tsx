import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WhitepaperPdfUpload } from "@/components/admin/WhitepaperPdfUpload";

export default async function AdminWhitepaperPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">White paper PDF</h1>
      <WhitepaperPdfUpload />
    </div>
  );
}
