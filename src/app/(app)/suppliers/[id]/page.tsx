import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { SupplierForm } from "../supplier-form";
import { updateSupplier, deleteSupplier } from "@/lib/actions/suppliers";

export default async function SupplierDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { materials: true },
  });
  if (!supplier) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={supplier.name}
        actions={
          <Link href="/suppliers" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      {error === "has-materials" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This supplier has raw materials assigned and can&apos;t be deleted.
        </p>
      )}

      <div className="card space-y-6 p-6">
        <form id="supplier-form" action={updateSupplier.bind(null, id)} className="space-y-6">
          <SupplierForm supplier={supplier} />
        </form>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <form action={deleteSupplier.bind(null, id)}>
            <ConfirmSubmitButton
              confirmMessage={`Delete supplier "${supplier.name}"?`}
              className="btn-danger"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
          <button type="submit" form="supplier-form" className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Materials Supplied</h2>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {supplier.materials.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    No materials linked yet.
                  </td>
                </tr>
              )}
              {supplier.materials.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link
                      href={`/inventory/${m.id}`}
                      className="font-medium text-slate-900 hover:text-orange-600"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td>{m.sku}</td>
                  <td>
                    {m.stockQty} {m.unit}
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
