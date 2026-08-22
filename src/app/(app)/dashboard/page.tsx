import Link from "next/link";
import { getDashboardData } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { ProductionChart } from "@/components/charts/production-chart";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { kpis, monthlyRevenue, productionByStage, lowStock, recentOrders } =
    await getDashboardData();
  const { error } = await searchParams;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A snapshot of sales, production and inventory health."
      />

      {error === "forbidden" && (
        <p className="mb-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You don&apos;t have permission to access that page.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales (open orders)" value={formatCurrency(kpis.totalRevenue)} />
        <StatCard
          label="Open Orders"
          value={String(kpis.openOrders)}
          hint="Pending or confirmed"
        />
        <StatCard
          label="In Production"
          value={String(kpis.inProduction)}
          hint="Orders currently manufacturing"
        />
        <StatCard
          label="Low Stock Alerts"
          value={String(kpis.lowStockCount)}
          tone={kpis.lowStockCount > 0 ? "danger" : "default"}
          hint="Items at or below reorder level"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Revenue — last 6 months
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Based on order value, excluding cancelled orders.
          </p>
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Production Pipeline
          </h2>
          <p className="mb-4 text-xs text-slate-500">Open work orders by stage.</p>
          <ProductionChart data={productionByStage} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-medium text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentOrders.length === 0 && (
              <li className="py-4 text-sm text-slate-500">No orders yet.</li>
            )}
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-orange-600"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {o.customerName} · {formatDate(o.orderDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-700">
                    {formatCurrency(o.total)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Low Stock</h2>
            <Link href="/inventory" className="text-xs font-medium text-orange-600 hover:underline">
              View inventory
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {lowStock.length === 0 && (
              <li className="py-4 text-sm text-slate-500">
                Everything is above reorder level. 🎉
              </li>
            )}
            {lowStock.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-slate-900 hover:text-orange-600"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500">{item.type}</p>
                </div>
                <span className="text-sm font-medium text-rose-600">
                  {item.stockQty} / {item.reorderLevel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
