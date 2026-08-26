import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/dal";
import { createEmployee } from "@/lib/actions/employees";
import { ROLES, ROLE_LABELS } from "@/lib/constants";

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("ADMIN");
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="New Employee" />
      {error === "duplicate-email" && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          That email is already registered to another account.
        </p>
      )}
      <form action={createEmployee} className="card space-y-4 p-6">
        <div>
          <label className="label">Full Name *</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" name="email" required className="input" />
        </div>
        <div>
          <label className="label">Temporary Password *</label>
          <input type="password" name="password" required minLength={6} className="input" />
        </div>
        <div>
          <label className="label">Role *</label>
          <select name="role" className="select" defaultValue="STAFF">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Department</label>
          <input name="department" className="input" placeholder="e.g. Production, Sales" />
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/employees" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Employee
          </button>
        </div>
      </form>
    </div>
  );
}
