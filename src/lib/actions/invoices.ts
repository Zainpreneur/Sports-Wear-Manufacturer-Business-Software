"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/dal";
import { INVOICE_STATUSES } from "@/lib/constants";

const StatusSchema = z.object({ status: z.enum(INVOICE_STATUSES) });

export async function updateInvoiceStatus(id: string, formData: FormData) {
  await requireSession();
  const { status } = StatusSchema.parse({ status: formData.get("status") });

  await prisma.invoice.update({
    where: { id },
    data: {
      status,
      paidDate: status === "PAID" ? new Date() : null,
    },
  });

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}
