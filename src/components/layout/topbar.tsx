import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { NAV_ITEMS } from "./nav-items";

export function Topbar({
  name,
  role,
}: {
  name: string;
  role: Role;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <details className="relative lg:hidden">
        <summary className="btn-secondary list-none">☰ Menu</summary>
        <div className="absolute left-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          {NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN").map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {item.icon} {item.label}
              </Link>
            )
          )}
        </div>
      </details>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost" title="Sign out">
            ⏻
          </button>
        </form>
      </div>
    </header>
  );
}
