import type { RawMaterialModel, SupplierModel } from "@/generated/prisma/models";
import { RAW_MATERIAL_CATEGORIES, UNITS } from "@/lib/constants";

export function MaterialForm({
  material,
  suppliers,
}: {
  material?: RawMaterialModel;
  suppliers: SupplierModel[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Name *</label>
        <input name="name" required defaultValue={material?.name} className="input" />
      </div>
      <div>
        <label className="label">SKU *</label>
        <input name="sku" required defaultValue={material?.sku} className="input" />
      </div>
      <div>
        <label className="label">Category *</label>
        <select name="category" defaultValue={material?.category ?? RAW_MATERIAL_CATEGORIES[0]} className="select">
          {RAW_MATERIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Unit *</label>
        <select name="unit" defaultValue={material?.unit ?? UNITS[0]} className="select">
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Supplier</label>
        <select
          name="supplierId"
          defaultValue={material?.supplierId ?? ""}
          className="select"
        >
          <option value="">None</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Cost per Unit ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="costPerUnit"
          defaultValue={material?.costPerUnit ?? 0}
          className="input"
        />
      </div>
      <div>
        <label className="label">
          {material ? "Current Stock" : "Opening Stock"}
        </label>
        {material ? (
          <>
            <input
              type="text"
              value={`${material.stockQty} ${material.unit}`}
              readOnly
              className="input bg-slate-50 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Use &quot;Adjust Stock&quot; below to change quantity.
            </p>
          </>
        ) : (
          <input
            type="number"
            step="0.01"
            min="0"
            name="stockQty"
            defaultValue={0}
            className="input"
          />
        )}
      </div>
      <div>
        <label className="label">Reorder Level</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="reorderLevel"
          defaultValue={material?.reorderLevel ?? 0}
          className="input"
        />
      </div>
    </div>
  );
}
