import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { updateInvoiceStatus } from "@/lib/actions/invoices";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: { include: { customer: true, items: { include: { product: true, variant: true } } } },
    },
  });
  if (!invoice) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={invoice.invoiceNumber}
        description={`Order ${invoice.order.orderNumber} · ${invoice.order.customer.name}`}
        actions={
          <Link href="/invoices" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Bill To</p>
            <p className="font-medium text-slate-900">{invoice.order.customer.name}</p>
            <p className="text-sm text-slate-500">{invoice.order.customer.company}</p>
            <p className="text-sm text-slate-500">{invoice.order.customer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={invoice.status} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="table-shell mb-4">
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
              {invoice.order.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.product.name}</td>
                  <td>{i.variant ? `${i.variant.size}/${i.variant.color}` : "—"}</td>
                  <td>{i.quantity}</td>
                  <td>{formatCurrency(i.unitPrice)}</td>
                  <td>{formatCurrency(i.quantity * i.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tax</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold text-slate-900">Payment Status</h2>
        <form action={updateInvoiceStatus.bind(null, id)} className="flex flex-wrap gap-2">
          <select name="status" defaultValue={invoice.status} className="select max-w-xs">
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {INVOICE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Update Status
          </button>
        </form>
        {invoice.paidDate && (
          <p className="text-xs text-slate-500">Paid on {formatDate(invoice.paidDate)}</p>
        )}
      </div>
    </div>
  );
}
