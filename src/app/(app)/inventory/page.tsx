import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { cx } from "@/lib/format";

export default async function InventoryPage() {
  const materials = await prisma.rawMaterial.findMany({
    orderBy: { name: "asc" },
    include: { supplier: true },
  });

  return (
    <div>
      <PageHeader
        title="Raw Materials"
        description="Fabric, trims and packaging stock used in production."
        actions={
          <Link href="/inventory/new" className="btn-primary">
            + New Material
          </Link>
        }
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No raw materials yet. Add your first one.
                </td>
              </tr>
            )}
            {materials.map((m) => {
              const low = m.stockQty <= m.reorderLevel;
              return (
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
                  <td>{m.category}</td>
                  <td>{m.supplier?.name || "—"}</td>
                  <td className={cx("font-medium", low && "text-rose-600")}>
                    {m.stockQty} {m.unit}
                    {low && " ⚠"}
                  </td>
                  <td>
                    {m.reorderLevel} {m.unit}
                  </td>
                  <td>${m.costPerUnit.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
