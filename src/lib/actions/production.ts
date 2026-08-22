"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";
import { PRODUCTION_STAGES, PRODUCTION_STATUSES } from "@/lib/constants";

const UpdateSchema = z.object({
  stage: z.enum(PRODUCTION_STAGES),
  status: z.enum(PRODUCTION_STATUSES),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateProductionOrder(id: string, formData: FormData) {
  await requireSession();
  const data = UpdateSchema.parse({
    stage: formData.get("stage"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  const existing = await prisma.productionOrder.findUniqueOrThrow({ where: { id } });

  const derivedStage = data.status === "COMPLETED" ? "COMPLETED" : data.stage;

  await prisma.productionOrder.update({
    where: { id },
    data: {
      stage: derivedStage,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes,
      startDate:
        existing.startDate ?? (data.status !== "NOT_STARTED" ? new Date() : null),
      completedDate: data.status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath(`/production/${id}`);
  revalidatePath("/production");
  revalidatePath("/dashboard");
  redirect(`/production/${id}`);
}

const CreateSchema = z.object({
  productName: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().positive(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function createStandaloneProductionOrder(formData: FormData) {
  await requireSession();
  const data = CreateSchema.parse({
    productName: formData.get("productName"),
    quantity: formData.get("quantity"),
    dueDate: formData.get("dueDate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  const { nextProductionNumber } = await import("@/lib/numbering");
  const productionNumber = await nextProductionNumber();

  const order = await prisma.productionOrder.create({
    data: {
      productionNumber,
      productName: data.productName,
      quantity: data.quantity,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
    },
  });

  revalidatePath("/production");
  redirect(`/production/${order.id}`);
}
