"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cx } from "@/lib/format";
import type { Role } from "@/lib/constants";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 text-slate-300 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white">
          AS
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Apex Sportswear</p>
          <p className="text-[11px] text-slate-500">Manufacturing Suite</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN").map(
          (item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-orange-600 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          }
        )}
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Apex Sportswear
      </div>
    </aside>
  );
}
