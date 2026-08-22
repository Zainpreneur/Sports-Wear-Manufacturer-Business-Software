"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";

const SupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

function readForm(formData: FormData) {
  return SupplierSchema.parse({
    name: formData.get("name"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    country: formData.get("country") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createSupplier(formData: FormData) {
  await requireSession();
  const data = readForm(formData);
  const supplier = await prisma.supplier.create({ data });
  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplier.id}`);
}

export async function updateSupplier(id: string, formData: FormData) {
  await requireSession();
  const data = readForm(formData);
  await prisma.supplier.update({ where: { id }, data });
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
  redirect(`/suppliers/${id}`);
}

export async function deleteSupplier(id: string) {
  await requireSession();
  const materialCount = await prisma.rawMaterial.count({ where: { supplierId: id } });
  if (materialCount > 0) {
    redirect(`/suppliers/${id}?error=has-materials`);
  }
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}
