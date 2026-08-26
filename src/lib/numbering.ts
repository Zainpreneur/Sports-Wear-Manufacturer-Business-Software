import { prisma } from "@/lib/prisma";

async function nextSequential(
  prefix: string,
  count: () => Promise<number>
) {
  const year = new Date().getFullYear();
  const n = (await count()) + 1;
  return `${prefix}-${year}-${String(n).padStart(4, "0")}`;
}

export async function nextOrderNumber() {
  return nextSequential("SO", () => prisma.salesOrder.count());
}

export async function nextProductionNumber() {
  return nextSequential("PO", () => prisma.productionOrder.count());
}

export async function nextInvoiceNumber() {
  return nextSequential("INV", () => prisma.invoice.count());
}
