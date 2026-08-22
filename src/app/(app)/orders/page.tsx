import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.salesOrder.findMany({
    where: status ? { status } : undefined,
    include: { customer: true, items: true },
    orderBy: { orderDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        description="Wholesale and team orders from customer to shipment."
        actions={
          <Link href="/orders/new" className="btn-primary">
            + New Order
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/orders"
          className={`btn-secondary text-xs ${!status ? "!bg-slate-900 !text-white" : ""}`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/orders?status=${s}`}
            className={`btn-secondary text-xs ${status === s ? "!bg-slate-900 !text-white" : ""}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link
                    href={`/orders/${o.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {o.orderNumber}
                  </Link>
                </td>
                <td>{o.customer.name}</td>
                <td>{formatDate(o.orderDate)}</td>
                <td>{formatDate(o.dueDate)}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td>
                  {formatCurrency(o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
