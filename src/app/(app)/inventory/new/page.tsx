import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { MaterialForm } from "../material-form";
import { createRawMaterial } from "@/lib/actions/inventory";

export default async function NewMaterialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New Raw Material" />
      {error === "duplicate-sku" && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          That SKU is already in use — choose a different one.
        </p>
      )}
      <form action={createRawMaterial} className="card space-y-6 p-6">
        <MaterialForm suppliers={suppliers} />
        <div className="flex justify-end gap-2">
          <Link href="/inventory" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Material
          </button>
        </div>
      </form>
    </div>
  );
}
