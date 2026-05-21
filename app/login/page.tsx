import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
