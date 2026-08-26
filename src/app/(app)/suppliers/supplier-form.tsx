import type { SupplierModel } from "@/generated/prisma/models";

export function SupplierForm({ supplier }: { supplier?: SupplierModel }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Name *</label>
        <input name="name" required defaultValue={supplier?.name} className="input" />
      </div>
      <div>
        <label className="label">Contact Name</label>
        <input
          name="contactName"
          defaultValue={supplier?.contactName ?? ""}
          className="input"
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={supplier?.email ?? ""}
          className="input"
        />
      </div>
      <div>
        <label className="label">Phone</label>
        <input name="phone" defaultValue={supplier?.phone ?? ""} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Address</label>
        <input name="address" defaultValue={supplier?.address ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Country</label>
        <input name="country" defaultValue={supplier?.country ?? ""} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Notes</label>
        <textarea name="notes" rows={3} defaultValue={supplier?.notes ?? ""} className="input" />
      </div>
    </div>
  );
}
