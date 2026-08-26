import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { PageHeader } from "@/components/page-header";
import { updateEmployee, toggleEmployeeActive } from "@/lib/actions/employees";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireRole("ADMIN");
  const { error } = await searchParams;
  const employees = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage staff accounts and roles."
        actions={
          <Link href="/employees/new" className="btn-primary">
            + New Employee
          </Link>
        }
      />

      {error === "self-demote" && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You can&apos;t remove your own admin role.
        </p>
      )}
      {error === "self-deactivate" && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You can&apos;t deactivate your own account.
        </p>
      )}

      <div className="space-y-3">
        {employees.map((u) => (
          <details key={u.id} className="card group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {u.name}
                    {u.id === session.userId && (
                      <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}</span>
                <span className="text-slate-400">{u.department || "—"}</span>
                <span className={u.active ? "text-emerald-600" : "text-slate-400"}>
                  {u.active ? "Active" : "Inactive"}
                </span>
                <span className="text-orange-600 group-open:hidden">Edit ▾</span>
                <span className="hidden text-orange-600 group-open:inline">Close ▴</span>
              </div>
            </summary>

            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <form action={updateEmployee.bind(null, u.id)} className="space-y-3">
                <div>
                  <label className="label">Name</label>
                  <input name="name" defaultValue={u.name} required className="input" />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select name="role" defaultValue={u.role} className="select">
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <input name="department" defaultValue={u.department ?? ""} className="input" />
                </div>
                <div>
                  <label className="label">Reset Password</label>
                  <input
                    type="password"
                    name="password"
                    minLength={6}
                    className="input"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </form>
              <div className="space-y-3 text-sm text-slate-500">
                <p>Joined {formatDate(u.createdAt)}</p>
                <form action={toggleEmployeeActive.bind(null, u.id, !u.active)}>
                  <button type="submit" className={u.active ? "btn-danger" : "btn-secondary"}>
                    {u.active ? "Deactivate Account" : "Reactivate Account"}
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
