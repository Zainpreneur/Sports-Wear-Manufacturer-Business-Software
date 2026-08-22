import "server-only";
import { prisma } from "@/lib/prisma";
import { PRODUCTION_STAGES } from "@/lib/constants";

export async function getDashboardData() {
  const [
    orders,
    openOrdersCount,
    inProductionCount,
    lowStockVariants,
    lowStockMaterials,
    recentOrders,
    productionOrders,
    unpaidInvoiceTotal,
  ] = await Promise.all([
    prisma.salesOrder.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { items: true },
      orderBy: { orderDate: "asc" },
    }),
    prisma.salesOrder.count({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.salesOrder.count({ where: { status: "IN_PRODUCTION" } }),
    prisma.productVariant.findMany({
      where: {},
      include: { product: true },
    }),
    prisma.rawMaterial.findMany(),
    prisma.salesOrder.findMany({
      include: { customer: true, items: true },
      orderBy: { orderDate: "desc" },
      take: 6,
    }),
    prisma.productionOrder.groupBy({
      by: ["stage"],
      _count: { _all: true },
      where: { status: { not: "COMPLETED" } },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    0
  );

  // Revenue for the last 6 calendar months, keyed by "YYYY-MM".
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  const revenueByMonth = new Map(months.map((m) => [m.key, 0]));
  for (const order of orders) {
    const d = new Date(order.orderDate);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (revenueByMonth.has(key)) {
      const total = order.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + total);
    }
  }
  const monthlyRevenue = months.map((m) => ({
    month: m.label,
    revenue: Math.round((revenueByMonth.get(m.key) ?? 0) * 100) / 100,
  }));

  const stageCounts = new Map(productionOrders.map((p) => [p.stage, p._count._all]));
  const productionByStage = PRODUCTION_STAGES.filter((s) => s !== "COMPLETED").map(
    (stage) => ({ stage, count: stageCounts.get(stage) ?? 0 })
  );

  const lowStock = [
    ...lowStockVariants
      .filter((v) => v.stockQty <= v.reorderLevel)
      .map((v) => ({
        id: v.id,
        name: `${v.product.name} — ${v.size}/${v.color}`,
        type: "Finished Good" as const,
        stockQty: v.stockQty,
        reorderLevel: v.reorderLevel,
        href: `/products/${v.productId}`,
      })),
    ...lowStockMaterials
      .filter((m) => m.stockQty <= m.reorderLevel)
      .map((m) => ({
        id: m.id,
        name: m.name,
        type: "Raw Material" as const,
        stockQty: m.stockQty,
        reorderLevel: m.reorderLevel,
        href: `/inventory/${m.id}`,
      })),
  ].sort((a, b) => a.stockQty - b.stockQty);

  return {
    kpis: {
      totalRevenue,
      openOrders: openOrdersCount,
      inProduction: inProductionCount,
      lowStockCount: lowStock.length,
      unpaidAmount: unpaidInvoiceTotal._sum.totalAmount ?? 0,
    },
    monthlyRevenue,
    productionByStage,
    lowStock: lowStock.slice(0, 8),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customer.name,
      status: o.status,
      orderDate: o.orderDate,
      total: o.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    })),
  };
}
