import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  updateOrderStatus,
  startProduction,
  generateInvoice,
  cancelOrder,
} from "@/lib/actions/orders";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PRODUCTION_STAGE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } },
      productionOrders: { orderBy: { createdAt: "desc" } },
      invoice: true,
    },
  });
  if (!order) notFound();

  const subtotal = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const isFinal = order.status === "CANCELLED" || order.status === "DELIVERED";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customer.name} · Ordered ${formatDate(order.orderDate)}`}
        actions={
          <Link href="/orders" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Line Items</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link
                        href={`/products/${i.productId}`}
                        className="font-medium text-slate-900 hover:text-orange-600"
                      >
                        {i.product.name}
                      </Link>
                    </td>
                    <td>{i.variant ? `${i.variant.size}/${i.variant.color}` : "—"}</td>
                    <td>{i.quantity}</td>
                    <td>{formatCurrency(i.unitPrice)}</td>
                    <td>{formatCurrency(i.quantity * i.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-right text-sm font-semibold text-slate-900">
            Subtotal: {formatCurrency(subtotal)}
          </p>
          {order.notes && (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Notes: </span>
              {order.notes}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="card space-y-3 p-6">
            <h2 className="text-sm font-semibold text-slate-900">Status</h2>
            <form action={updateOrderStatus.bind(null, id)} className="flex gap-2">
              <select name="status" defaultValue={order.status} className="select" disabled={isFinal}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-secondary" disabled={isFinal}>
                Update
              </button>
            </form>

            {!isFinal && (
              <form action={cancelOrder.bind(null, id)}>
                <ConfirmSubmitButton
                  confirmMessage="Cancel this order? This cannot be undone."
                  className="btn-danger w-full text-xs"
                >
                  Cancel Order
                </ConfirmSubmitButton>
              </form>
            )}
          </div>

          <div className="card space-y-3 p-6">
            <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
            <form action={startProduction.bind(null, id)}>
              <button type="submit" className="btn-secondary w-full" disabled={isFinal}>
                🏭 Start Production Order
              </button>
            </form>
            {order.invoice ? (
              <Link href={`/invoices/${order.invoice.id}`} className="btn-secondary block w-full text-center">
                View Invoice ({order.invoice.invoiceNumber})
              </Link>
            ) : (
              <form action={generateInvoice.bind(null, id)}>
                <button type="submit" className="btn-primary w-full">
                  💵 Generate Invoice
                </button>
              </form>
            )}
          </div>

          {order.productionOrders.length > 0 && (
            <div className="card space-y-2 p-6">
              <h2 className="text-sm font-semibold text-slate-900">Production Orders</h2>
              <ul className="space-y-2">
                {order.productionOrders.map((p) => (
                  <li key={p.id} className="text-sm">
                    <Link
                      href={`/production/${p.id}`}
                      className="font-medium text-slate-900 hover:text-orange-600"
                    >
                      {p.productionNumber}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {PRODUCTION_STAGE_LABELS[p.stage as keyof typeof PRODUCTION_STAGE_LABELS]} ·{" "}
                      {p.quantity} units
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
