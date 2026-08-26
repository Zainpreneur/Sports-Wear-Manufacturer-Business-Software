import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Retailers, teams and clubs you sell finished goods to."
        actions={
          <Link href="/customers/new" className="btn-primary">
            + New Customer
          </Link>
        }
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No customers yet. Add your first one.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link
                    href={`/customers/${c.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {c.name}
                  </Link>
                </td>
                <td>{c.company || "—"}</td>
                <td>
                  <div>{c.email || "—"}</div>
                  <div className="text-xs text-slate-400">{c.phone || ""}</div>
                </td>
                <td>{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                <td>{c._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
