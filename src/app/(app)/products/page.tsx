import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Your sportswear catalog — jerseys, kits, and accessories."
        actions={
          <Link href="/products/new" className="btn-primary">
            + New Product
          </Link>
        }
      />

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Variants</th>
              <th>Total Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stockQty, 0);
              return (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/products/${p.id}`}
                      className="font-medium text-slate-900 hover:text-orange-600"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td>{p.variants.length}</td>
                  <td>{totalStock}</td>
                  <td>
                    {p.active ? (
                      <span className="text-emerald-600">Active</span>
                    ) : (
                      <span className="text-slate-400">Inactive</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
