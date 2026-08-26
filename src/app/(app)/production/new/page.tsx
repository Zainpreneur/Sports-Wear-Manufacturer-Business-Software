import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { createStandaloneProductionOrder } from "@/lib/actions/production";

export default function NewProductionOrderPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="New Work Order"
        description="For internal production runs not tied to a specific sales order (e.g. building up stock)."
      />
      <form action={createStandaloneProductionOrder} className="card space-y-4 p-6">
        <div>
          <label className="label">Description *</label>
          <input
            name="productName"
            required
            className="input"
            placeholder="e.g. Home Jersey 2026 (L, Red) — stock build"
          />
        </div>
        <div>
          <label className="label">Quantity *</label>
          <input type="number" name="quantity" min="1" required className="input" />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="dueDate" className="input" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" rows={3} className="input" />
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/production" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Work Order
          </button>
        </div>
      </form>
    </div>
  );
}
