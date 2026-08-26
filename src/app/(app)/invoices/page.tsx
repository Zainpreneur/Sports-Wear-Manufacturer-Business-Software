import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { customer: true } } },
    orderBy: { issueDate: "desc" },
  });

  const totals = invoices.reduce(
    (acc, inv) => {
      acc.total += inv.totalAmount;
      if (inv.status !== "PAID") acc.outstanding += inv.totalAmount;
      return acc;
    },
    { total: 0, outstanding: 0 }
  );

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${formatCurrency(totals.outstanding)} outstanding across ${invoices.length} invoices.`}
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Order</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No invoices yet. Generate one from a sales order.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-slate-900 hover:text-orange-600"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td>{inv.order.customer.name}</td>
                <td>
                  <Link href={`/orders/${inv.orderId}`} className="text-orange-600 hover:underline">
                    {inv.order.orderNumber}
                  </Link>
                </td>
                <td>{formatDate(inv.issueDate)}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>
                  <StatusBadge status={inv.status} />
                </td>
                <td>{formatCurrency(inv.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
