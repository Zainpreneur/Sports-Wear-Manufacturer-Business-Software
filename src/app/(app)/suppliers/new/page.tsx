import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SupplierForm } from "../supplier-form";
import { createSupplier } from "@/lib/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New Supplier" />
      <form action={createSupplier} className="card space-y-6 p-6">
        <SupplierForm />
        <div className="flex justify-end gap-2">
          <Link href="/suppliers" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Supplier
          </button>
        </div>
      </form>
    </div>
  );
}
