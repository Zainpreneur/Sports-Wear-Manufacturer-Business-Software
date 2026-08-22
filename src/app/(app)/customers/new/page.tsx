import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { CustomerForm } from "../customer-form";
import { createCustomer } from "@/lib/actions/customers";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New Customer" />
      <form action={createCustomer} className="card space-y-6 p-6">
        <CustomerForm />
        <div className="flex justify-end gap-2">
          <Link href="/customers" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Customer
          </button>
        </div>
      </form>
    </div>
  );
}
