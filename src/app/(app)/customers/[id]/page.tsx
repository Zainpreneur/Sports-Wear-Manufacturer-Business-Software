import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomerForm } from "../customer-form";
import { updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { items: true },
        orderBy: { orderDate: "desc" },
      },
    },
  });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.company ?? undefined}
        actions={
          <Link href="/customers" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      {error === "has-orders" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This customer has existing orders and can&apos;t be deleted.
        </p>
      )}

      <div className="card space-y-6 p-6">
        <form id="customer-form" action={updateCustomer.bind(null, id)} className="space-y-6">
          <CustomerForm customer={customer} />
        </form>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <form action={deleteCustomer.bind(null, id)}>
            <ConfirmSubmitButton
              confirmMessage={`Delete customer "${customer.name}"? This cannot be undone.`}
              className="btn-danger"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
          <button type="submit" form="customer-form" className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Order History</h2>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No orders yet.
                  </td>
                </tr>
              )}
              {customer.orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-medium text-slate-900 hover:text-orange-600"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>{formatDate(o.orderDate)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td>
                    {formatCurrency(
                      o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
