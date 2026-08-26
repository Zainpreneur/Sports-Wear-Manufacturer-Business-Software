import type { ProductModel } from "@/generated/prisma/models";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export function ProductForm({ product }: { product?: ProductModel }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Name *</label>
        <input name="name" required defaultValue={product?.name} className="input" />
      </div>
      <div>
        <label className="label">SKU *</label>
        <input name="sku" required defaultValue={product?.sku} className="input" />
      </div>
      <div>
        <label className="label">Category *</label>
        <select name="category" defaultValue={product?.category ?? PRODUCT_CATEGORIES[0]} className="select">
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Image URL</label>
        <input name="imageUrl" defaultValue={product?.imageUrl ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Selling Price ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="price"
          defaultValue={product?.price ?? 0}
          className="input"
        />
      </div>
      <div>
        <label className="label">Cost Price ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="costPrice"
          defaultValue={product?.costPrice ?? 0}
          className="input"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="input"
        />
      </div>
    </div>
  );
}
