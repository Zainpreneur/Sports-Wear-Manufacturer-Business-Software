import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-lg font-bold text-white">
            AS
          </div>
          <h1 className="text-xl font-semibold text-white">Apex Sportswear</h1>
          <p className="mt-1 text-sm text-slate-400">Manufacturing &amp; Operations Suite</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Demo login — admin@apexsportswear.test / admin123
        </p>
      </div>
    </div>
  );
}
