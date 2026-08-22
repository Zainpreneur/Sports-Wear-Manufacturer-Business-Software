"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";
import { PRODUCT_CATEGORIES, SIZES } from "@/lib/constants";
import { isUniqueConstraintError } from "@/lib/db-errors";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.enum(PRODUCT_CATEGORIES),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  imageUrl: z.string().url().or(z.literal("")).optional(),
});

function readProductForm(formData: FormData) {
  return ProductSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    costPrice: formData.get("costPrice"),
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createProduct(formData: FormData) {
  await requireSession();
  const data = readProductForm(formData);
  let product;
  try {
    product = await prisma.product.create({ data });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      redirect("/products/new?error=duplicate-sku");
    }
    throw err;
  }
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  await requireSession();
  const data = readProductForm(formData);
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireSession();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  await requireSession();
  const orderItemCount = await prisma.salesOrderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    redirect(`/products/${id}?error=has-orders`);
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  redirect("/products");
}

// --- Variants ---------------------------------------------------------

const VariantSchema = z.object({
  size: z.enum(SIZES),
  color: z.string().min(1, "Color is required"),
  sku: z.string().min(1, "SKU is required"),
  stockQty: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0),
});

export async function addVariant(productId: string, formData: FormData) {
  await requireSession();
  const data = VariantSchema.parse({
    size: formData.get("size"),
    color: formData.get("color"),
    sku: formData.get("sku"),
    stockQty: formData.get("stockQty"),
    reorderLevel: formData.get("reorderLevel"),
  });
  try {
    await prisma.productVariant.create({ data: { ...data, productId } });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      redirect(`/products/${productId}?error=duplicate-variant`);
    }
    throw err;
  }
  revalidatePath(`/products/${productId}`);
}

export async function deleteVariant(productId: string, variantId: string) {
  await requireSession();
  const usedCount = await prisma.salesOrderItem.count({ where: { variantId } });
  if (usedCount === 0) {
    await prisma.productVariant.delete({ where: { id: variantId } });
  }
  revalidatePath(`/products/${productId}`);
}

const AdjustVariantSchema = z.object({
  direction: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().positive(),
  reason: z.string().optional(),
});

export async function adjustVariantStock(
  productId: string,
  variantId: string,
  formData: FormData
) {
  await requireSession();
  const { direction, quantity, reason } = AdjustVariantSchema.parse({
    direction: formData.get("direction"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason") || undefined,
  });
  const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
  const delta = direction === "IN" ? quantity : -quantity;
  const newQty = Math.max(0, variant.stockQty + delta);

  await prisma.$transaction([
    prisma.productVariant.update({ where: { id: variantId }, data: { stockQty: newQty } }),
    prisma.stockMovement.create({
      data: {
        type: direction === "IN" ? "VARIANT_IN" : "VARIANT_OUT",
        quantity,
        reason: reason || "Manual adjustment",
        variantId,
      },
    }),
  ]);

  revalidatePath(`/products/${productId}`);
}

// --- Bill of Materials --------------------------------------------------

const BomSchema = z.object({
  rawMaterialId: z.string().min(1, "Select a material"),
  qtyPerUnit: z.coerce.number().positive("Quantity must be greater than 0"),
});

export async function addBomItem(productId: string, formData: FormData) {
  await requireSession();
  const data = BomSchema.parse({
    rawMaterialId: formData.get("rawMaterialId"),
    qtyPerUnit: formData.get("qtyPerUnit"),
  });
  await prisma.bomItem.upsert({
    where: {
      productId_rawMaterialId: { productId, rawMaterialId: data.rawMaterialId },
    },
    create: { ...data, productId },
    update: { qtyPerUnit: data.qtyPerUnit },
  });
  revalidatePath(`/products/${productId}`);
}

export async function deleteBomItem(productId: string, bomItemId: string) {
  await requireSession();
  await prisma.bomItem.delete({ where: { id: bomItemId } });
  revalidatePath(`/products/${productId}`);
}
