"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";
import { ORDER_STATUSES } from "@/lib/constants";
import { nextOrderNumber, nextProductionNumber, nextInvoiceNumber } from "@/lib/numbering";

const LineItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0),
});

const CreateOrderSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(LineItemSchema).min(1, "Add at least one line item"),
});

export async function createOrder(formData: FormData) {
  await requireSession();

  const itemsRaw = formData.get("itemsJson");
  const items = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : [];

  const data = CreateOrderSchema.parse({
    customerId: formData.get("customerId"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
    items,
  });

  const orderNumber = await nextOrderNumber();

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

const StatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireSession();
  const { status } = StatusSchema.parse({ status: formData.get("status") });

  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  // Decrement finished-goods stock exactly once, the moment an order ships.
  if (status === "SHIPPED" && order.status !== "SHIPPED" && order.status !== "DELIVERED") {
    const ops = [];
    for (const item of order.items) {
      if (!item.variantId) continue;
      const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant) continue;
      const newQty = Math.max(0, variant.stockQty - item.quantity);
      ops.push(
        prisma.productVariant.update({ where: { id: item.variantId }, data: { stockQty: newQty } })
      );
      ops.push(
        prisma.stockMovement.create({
          data: {
            type: "VARIANT_OUT",
            quantity: item.quantity,
            reason: `Order ${order.orderNumber} shipped`,
            variantId: item.variantId,
          },
        })
      );
    }
    ops.push(prisma.salesOrder.update({ where: { id }, data: { status } }));
    await prisma.$transaction(ops);
  } else {
    await prisma.salesOrder.update({ where: { id }, data: { status } });
  }

  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}

export async function startProduction(id: string) {
  await requireSession();
  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id },
    include: { items: { include: { product: true, variant: true } } },
  });

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const label = order.items
    .map((i) => `${i.product.name}${i.variant ? ` (${i.variant.size}/${i.variant.color})` : ""} x${i.quantity}`)
    .join(", ");

  const productionNumber = await nextProductionNumber();

  await prisma.$transaction([
    prisma.productionOrder.create({
      data: {
        productionNumber,
        salesOrderId: id,
        productName: label.length > 180 ? `${order.orderNumber} — ${totalQty} units` : label,
        quantity: totalQty,
      },
    }),
    prisma.salesOrder.update({ where: { id }, data: { status: "IN_PRODUCTION" } }),
  ]);

  revalidatePath(`/orders/${id}`);
  revalidatePath("/production");
  revalidatePath("/dashboard");
}

export async function generateInvoice(id: string) {
  await requireSession();
  const existing = await prisma.invoice.findUnique({ where: { orderId: id } });
  if (existing) redirect(`/invoices/${existing.id}`);

  const order = await prisma.salesOrder.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });
  const amount = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = Math.round(amount * 0.08 * 100) / 100;
  const totalAmount = Math.round((amount + tax) * 100) / 100;
  const invoiceNumber = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: id,
      amount,
      tax,
      totalAmount,
      dueDate: order.dueDate ?? undefined,
    },
  });

  revalidatePath(`/orders/${id}`);
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function cancelOrder(id: string) {
  await requireSession();
  await prisma.salesOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath(`/orders/${id}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
