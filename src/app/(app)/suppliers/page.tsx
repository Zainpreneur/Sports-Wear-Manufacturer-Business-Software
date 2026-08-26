import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { materials: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Vendors you source fabric, trims and packaging from."
        actions={
          <Link href="/suppliers/new" className="btn-primary">
            + New Supplier
          </Link>
        }
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Country</th>
              <th>Materials Supplied</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No suppliers yet. Add your first one.
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link
                    href={`/suppliers/${s.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {s.name}
                  </Link>
                </td>
                <td>
                  <div>{s.contactName || "—"}</div>
                  <div className="text-xs text-slate-400">{s.email || ""}</div>
                </td>
                <td>{s.country || "—"}</td>
                <td>{s._count.materials}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
