import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ProductForm } from "../product-form";
import {
  updateProduct,
  deleteProduct,
  addVariant,
  deleteVariant,
  adjustVariantStock,
  addBomItem,
  deleteBomItem,
} from "@/lib/actions/products";
import { SIZES } from "@/lib/constants";
import { formatCurrency, cx } from "@/lib/format";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [product, rawMaterials] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
        bomItems: { include: { rawMaterial: true } },
      },
    }),
    prisma.rawMaterial.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const estimatedMaterialCost = product.bomItems.reduce(
    (s, b) => s + b.qtyPerUnit * b.rawMaterial.costPerUnit,
    0
  );
  const usedMaterialIds = new Set(product.bomItems.map((b) => b.rawMaterialId));
  const availableMaterials = rawMaterials.filter((m) => !usedMaterialIds.has(m.id));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku} · ${product.category}`}
        actions={
          <Link href="/products" className="btn-secondary">
            ← Back
          </Link>
        }
      />

      {error === "has-orders" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This product has existing sales orders and can&apos;t be deleted.
        </p>
      )}
      {error === "duplicate-variant" && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          That size/color (or SKU) already exists for this product.
        </p>
      )}

      <div className="card space-y-6 p-6">
        <form id="product-form" action={updateProduct.bind(null, id)} className="space-y-6">
          <ProductForm product={product} />
        </form>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <form action={deleteProduct.bind(null, id)}>
            <ConfirmSubmitButton
              confirmMessage={`Delete product "${product.name}"?`}
              className="btn-danger"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
          <button type="submit" form="product-form" className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>

      {/* Variants */}
      <div className="card p-6">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">
          Sizes &amp; Colors (Variants)
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Each size/color combination tracks its own finished-goods stock.
        </p>

        <div className="table-shell mb-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Color</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reorder</th>
                <th>Adjust</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No variants yet. Add sizes/colors below.
                  </td>
                </tr>
              )}
              {product.variants.map((v) => {
                const low = v.stockQty <= v.reorderLevel;
                return (
                  <tr key={v.id}>
                    <td>{v.size}</td>
                    <td>{v.color}</td>
                    <td>{v.sku}</td>
                    <td className={cx("font-medium", low && "text-rose-600")}>
                      {v.stockQty}
                      {low && " ⚠"}
                    </td>
                    <td>{v.reorderLevel}</td>
                    <td>
                      <form
                        action={adjustVariantStock.bind(null, id, v.id)}
                        className="flex items-center gap-1"
                      >
                        <select name="direction" className="select w-16 !px-1 !py-1 text-xs" defaultValue="IN">
                          <option value="IN">+IN</option>
                          <option value="OUT">-OUT</option>
                        </select>
                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          defaultValue={1}
                          required
                          className="input w-16 !px-2 !py-1 text-xs"
                        />
                        <button type="submit" className="btn-secondary !px-2 !py-1 text-xs">
                          Go
                        </button>
                      </form>
                    </td>
                    <td>
                      <form action={deleteVariant.bind(null, id, v.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`Remove variant ${v.size}/${v.color}?`}
                          className="btn-ghost !px-2 !py-1 text-xs text-rose-600"
                        >
                          Remove
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form
          action={addVariant.bind(null, id)}
          className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-4"
        >
          <div>
            <label className="label">Size</label>
            <select name="size" className="select">
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <input name="color" required className="input" placeholder="Navy" />
          </div>
          <div>
            <label className="label">SKU</label>
            <input name="sku" required className="input" placeholder={`${product.sku}-M-NVY`} />
          </div>
          <div>
            <label className="label">Opening Stock</label>
            <input type="number" name="stockQty" min="0" defaultValue={0} className="input w-28" />
          </div>
          <div>
            <label className="label">Reorder Level</label>
            <input
              type="number"
              name="reorderLevel"
              min="0"
              defaultValue={10}
              className="input w-28"
            />
          </div>
          <button type="submit" className="btn-primary">
            + Add Variant
          </button>
        </form>
      </div>

      {/* Bill of Materials */}
      <div className="card p-6">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Bill of Materials</h2>
        <p className="mb-4 text-xs text-slate-500">
          Raw materials consumed per unit produced. Estimated material cost:{" "}
          <span className="font-medium text-slate-700">
            {formatCurrency(estimatedMaterialCost)}
          </span>{" "}
          / unit.
        </p>

        <div className="table-shell mb-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Qty per Unit</th>
                <th>Unit Cost</th>
                <th>Cost / Unit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {product.bomItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No materials linked yet.
                  </td>
                </tr>
              )}
              {product.bomItems.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link
                      href={`/inventory/${b.rawMaterialId}`}
                      className="font-medium text-slate-900 hover:text-orange-600"
                    >
                      {b.rawMaterial.name}
                    </Link>
                  </td>
                  <td>
                    {b.qtyPerUnit} {b.rawMaterial.unit}
                  </td>
                  <td>${b.rawMaterial.costPerUnit.toFixed(2)}</td>
                  <td>{formatCurrency(b.qtyPerUnit * b.rawMaterial.costPerUnit)}</td>
                  <td>
                    <form action={deleteBomItem.bind(null, id, b.id)}>
                      <ConfirmSubmitButton
                        confirmMessage="Remove this material from the BOM?"
                        className="btn-ghost !px-2 !py-1 text-xs text-rose-600"
                      >
                        Remove
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {availableMaterials.length > 0 ? (
          <form
            action={addBomItem.bind(null, id)}
            className="flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-4"
          >
            <div>
              <label className="label">Material</label>
              <select name="rawMaterialId" className="select" required>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Qty per Unit</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="qtyPerUnit"
                required
                className="input w-32"
              />
            </div>
            <button type="submit" className="btn-primary">
              + Add Material
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-400">
            All raw materials are already linked, or none exist yet — add some in{" "}
            <Link href="/inventory" className="text-orange-600 hover:underline">
              Raw Materials
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
