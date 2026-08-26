import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { MaterialForm } from "../material-form";
import {
  updateRawMaterial,
  deleteRawMaterial,
  adjustRawMaterialStock,
} from "@/lib/actions/inventory";
import { formatDateTime } from "@/lib/format";

export default async function MaterialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [material, suppliers, movements] = await Promise.all([
    prisma.rawMaterial.findUnique({ where: { id } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      where: { rawMaterialId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!material) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={material.name}
        description={`SKU: ${material.sku}`}
        actions={
          <Link href="/inventory" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      {error === "in-use" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This material is used in a product&apos;s bill of materials and can&apos;t be deleted.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-6 p-6 lg:col-span-2">
          <form id="material-form" action={updateRawMaterial.bind(null, id)} className="space-y-6">
            <MaterialForm material={material} suppliers={suppliers} />
          </form>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <form action={deleteRawMaterial.bind(null, id)}>
              <ConfirmSubmitButton
                confirmMessage={`Delete raw material "${material.name}"?`}
                className="btn-danger"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
            <button type="submit" form="material-form" className="btn-primary">
              Save Changes
            </button>
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Adjust Stock</h2>
          <p className="text-2xl font-semibold text-slate-900">
            {material.stockQty} <span className="text-sm text-slate-500">{material.unit}</span>
          </p>
          <form action={adjustRawMaterialStock.bind(null, id)} className="space-y-3">
            <div>
              <label className="label">Direction</label>
              <select name="direction" className="select" defaultValue="IN">
                <option value="IN">Stock In (received)</option>
                <option value="OUT">Stock Out (used/wasted)</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="quantity"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Reason</label>
              <input name="reason" className="input" placeholder="e.g. PO #1234 received" />
            </div>
            <button type="submit" className="btn-primary w-full">
              Apply
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Stock Movements</h2>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No movements recorded yet.
                  </td>
                </tr>
              )}
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{formatDateTime(m.createdAt)}</td>
                  <td>{m.type.replaceAll("_", " ")}</td>
                  <td
                    className={
                      m.type.endsWith("IN") ? "text-emerald-600" : "text-rose-600"
                    }
                  >
                    {m.type.endsWith("IN") ? "+" : "-"}
                    {m.quantity} {material.unit}
                  </td>
                  <td>{m.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
