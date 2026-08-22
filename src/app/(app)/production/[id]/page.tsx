import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { updateProductionOrder } from "@/lib/actions/production";
import {
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_LABELS,
  PRODUCTION_STATUSES,
  PRODUCTION_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function ProductionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.productionOrder.findUnique({
    where: { id },
    include: { salesOrder: { include: { customer: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={order.productionNumber}
        description={order.productName}
        actions={
          <Link href="/production" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      {order.salesOrder && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Linked to sales order{" "}
          <Link href={`/orders/${order.salesOrder.id}`} className="font-medium text-orange-600 hover:underline">
            {order.salesOrder.orderNumber}
          </Link>{" "}
          for {order.salesOrder.customer.name}.
        </p>
      )}

      <form action={updateProductionOrder.bind(null, id)} className="card space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="label">Quantity</p>
            <p className="text-lg font-semibold text-slate-900">{order.quantity} units</p>
          </div>
          <div>
            <p className="label">Started</p>
            <p className="text-sm text-slate-700">{formatDate(order.startDate)}</p>
          </div>
          <div>
            <label className="label">Stage</label>
            <select name="stage" defaultValue={order.stage} className="select">
              {PRODUCTION_STAGES.map((s) => (
                <option key={s} value={s}>
                  {PRODUCTION_STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" defaultValue={order.status} className="select">
              {PRODUCTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PRODUCTION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              name="dueDate"
              defaultValue={order.dueDate ? order.dueDate.toISOString().slice(0, 10) : ""}
              className="input"
            />
          </div>
          <div>
            <p className="label">Completed</p>
            <p className="text-sm text-slate-700">{formatDate(order.completedDate)}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} className="input" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
