import type { CustomerModel } from "@/generated/prisma/models";

export function CustomerForm({ customer }: { customer?: CustomerModel }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input name="name" required defaultValue={customer?.name} className="input" />
        </div>
        <div>
          <label className="label">Company</label>
          <input name="company" defaultValue={customer?.company ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={customer?.email ?? ""}
            className="input"
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" defaultValue={customer?.phone ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input name="address" defaultValue={customer?.address ?? ""} className="input" />
        </div>
        <div>
          <label className="label">City</label>
          <input name="city" defaultValue={customer?.city ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Country</label>
          <input name="country" defaultValue={customer?.country ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" rows={3} defaultValue={customer?.notes ?? ""} className="input" />
        </div>
      </div>
    </>
  );
}
