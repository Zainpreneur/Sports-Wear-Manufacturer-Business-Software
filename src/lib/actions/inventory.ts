"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";
import { RAW_MATERIAL_CATEGORIES, UNITS } from "@/lib/constants";
import { isUniqueConstraintError } from "@/lib/db-errors";

const BaseFields = {
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.enum(RAW_MATERIAL_CATEGORIES),
  unit: z.enum(UNITS),
  reorderLevel: z.coerce.number().min(0),
  costPerUnit: z.coerce.number().min(0),
  supplierId: z.string().optional(),
};
const CreateSchema = z.object({ ...BaseFields, stockQty: z.coerce.number().min(0) });
const UpdateSchema = z.object(BaseFields);

function readBase(formData: FormData) {
  return {
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    unit: formData.get("unit"),
    reorderLevel: formData.get("reorderLevel"),
    costPerUnit: formData.get("costPerUnit"),
    supplierId: formData.get("supplierId") || undefined,
  };
}

export async function createRawMaterial(formData: FormData) {
  await requireSession();
  const data = CreateSchema.parse({
    ...readBase(formData),
    stockQty: formData.get("stockQty"),
  });
  let material;
  try {
    material = await prisma.rawMaterial.create({ data });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      redirect("/inventory/new?error=duplicate-sku");
    }
    throw err;
  }
  revalidatePath("/inventory");
  redirect(`/inventory/${material.id}`);
}

export async function updateRawMaterial(id: string, formData: FormData) {
  await requireSession();
  const data = UpdateSchema.parse(readBase(formData));
  await prisma.rawMaterial.update({ where: { id }, data });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  redirect(`/inventory/${id}`);
}

export async function deleteRawMaterial(id: string) {
  await requireSession();
  const bomCount = await prisma.bomItem.count({ where: { rawMaterialId: id } });
  if (bomCount > 0) {
    redirect(`/inventory/${id}?error=in-use`);
  }
  await prisma.rawMaterial.delete({ where: { id } });
  revalidatePath("/inventory");
  redirect("/inventory");
}

const AdjustSchema = z.object({
  direction: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  reason: z.string().optional(),
});

export async function adjustRawMaterialStock(id: string, formData: FormData) {
  await requireSession();
  const { direction, quantity, reason } = AdjustSchema.parse({
    direction: formData.get("direction"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason") || undefined,
  });

  const material = await prisma.rawMaterial.findUniqueOrThrow({ where: { id } });
  const delta = direction === "IN" ? quantity : -quantity;
  const newQty = Math.max(0, material.stockQty + delta);

  await prisma.$transaction([
    prisma.rawMaterial.update({ where: { id }, data: { stockQty: newQty } }),
    prisma.stockMovement.create({
      data: {
        type: direction === "IN" ? "RAW_MATERIAL_IN" : "RAW_MATERIAL_OUT",
        quantity,
        reason: reason || "Manual adjustment",
        rawMaterialId: id,
      },
    }),
  ]);

  revalidatePath(`/inventory/${id}`);
  revalidatePath("/inventory");
}
