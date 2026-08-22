import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { OrderBuilder } from "../order-builder";
import { createOrder } from "@/lib/actions/orders";

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New Sales Order" />
      <form action={createOrder} className="card space-y-6 p-6">
        <OrderBuilder customers={customers} products={products} />
        <div className="flex justify-end gap-2">
          <Link href="/orders" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary">
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
}
