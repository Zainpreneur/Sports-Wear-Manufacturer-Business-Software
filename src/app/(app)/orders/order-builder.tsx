"use client";

import { useMemo, useState } from "react";
import type { CustomerModel } from "@/generated/prisma/models";

type Variant = { id: string; size: string; color: string; stockQty: number };
type ProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  variants: Variant[];
};

type Row = {
  key: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
};

function emptyRow(products: ProductOption[]): Row {
  const first = products[0];
  return {
    key: crypto.randomUUID(),
    productId: first?.id ?? "",
    variantId: first?.variants[0]?.id ?? "",
    quantity: 1,
    unitPrice: first?.price ?? 0,
  };
}

export function OrderBuilder({
  customers,
  products,
}: {
  customers: CustomerModel[];
  products: ProductOption[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    products.length > 0 ? [emptyRow(products)] : []
  );

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function onProductChange(key: string, productId: string) {
    const product = productMap.get(productId);
    updateRow(key, {
      productId,
      variantId: product?.variants[0]?.id ?? "",
      unitPrice: product?.price ?? 0,
    });
  }

  const total = rows.reduce((s, r) => s + r.quantity * r.unitPrice, 0);

  const itemsJson = JSON.stringify(
    rows
      .filter((r) => r.productId)
      .map((r) => ({
        productId: r.productId,
        variantId: r.variantId || undefined,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
      }))
  );

  if (products.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        You need at least one product before you can create an order.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Customer *</label>
          <select name="customerId" required className="select">
            {customers.length === 0 && <option value="">No customers yet</option>}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" name="dueDate" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" rows={2} className="input" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label !mb-0">Line Items *</label>
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => setRows((prev) => [...prev, emptyRow(products)])}
          >
            + Add Line
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((row) => {
            const product = productMap.get(row.productId);
            return (
              <div
                key={row.key}
                className="grid grid-cols-1 items-end gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[2fr_1.3fr_0.8fr_1fr_auto]"
              >
                <div>
                  <label className="label text-xs">Product</label>
                  <select
                    className="select"
                    value={row.productId}
                    onChange={(e) => onProductChange(row.key, e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Variant</label>
                  <select
                    className="select"
                    value={row.variantId}
                    onChange={(e) => updateRow(row.key, { variantId: e.target.value })}
                  >
                    <option value="">No variant</option>
                    {product?.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.size}/{v.color} ({v.stockQty} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Qty</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(row.key, { quantity: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <label className="label text-xs">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="input"
                    value={row.unitPrice}
                    onChange={(e) =>
                      updateRow(row.key, { unitPrice: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="btn-ghost text-xs text-rose-600"
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  disabled={rows.length === 1}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-right text-sm font-medium text-slate-700">
          Order Total: ${total.toFixed(2)}
        </p>
      </div>

      <input type="hidden" name="itemsJson" value={itemsJson} />
    </div>
  );
}
