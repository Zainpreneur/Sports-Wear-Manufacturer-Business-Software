import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PRODUCTION_STAGE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function ProductionPage() {
  const orders = await prisma.productionOrder.findMany({
    include: { salesOrder: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Production"
        description="Manufacturing work orders moving through the floor."
        actions={
          <Link href="/production/new" className="btn-primary">
            + New Work Order
          </Link>
        }
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Work Order</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Sales Order</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No production orders yet.
                </td>
              </tr>
            )}
            {orders.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link
                    href={`/production/${p.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {p.productionNumber}
                  </Link>
                </td>
                <td className="max-w-xs truncate" title={p.productName}>
                  {p.productName}
                </td>
                <td>{p.quantity}</td>
                <td>
                  {p.salesOrder ? (
                    <Link href={`/orders/${p.salesOrder.id}`} className="text-orange-600 hover:underline">
                      {p.salesOrder.orderNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{PRODUCTION_STAGE_LABELS[p.stage as keyof typeof PRODUCTION_STAGE_LABELS]}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td>{formatDate(p.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
