import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "../product-form";
import { createProduct } from "@/lib/actions/products";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New Product"
        description="You can add sizes/colors and a bill of materials after creating it."
      />
      {error === "duplicate-sku" && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          That SKU is already in use — choose a different one.
        </p>
      )}
      <form action={createProduct} className="card space-y-6 p-6">
        <ProductForm />
        <div className="flex justify-end gap-2">
          <Link href="/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}
