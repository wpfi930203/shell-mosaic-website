import Link from "next/link";

import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const siteData = await readSiteData();
  const todayOrders = siteData.orders.filter((order) =>
    order.createdAt.startsWith(new Date().toISOString().slice(0, 10)),
  );
  const totalSales = siteData.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lowStockCount = siteData.products.filter(
    (product) => product.stockQty <= product.lowStockThreshold,
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">
          Operational snapshot for Lansic Tiles.
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/content"
            className="min-h-11 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Open Content Manager
          </Link>
          <Link
            href="/admin/products"
            className="min-h-11 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700"
          >
            Edit Products
          </Link>
          <Link
            href="/admin/orders"
            className="min-h-11 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Today Orders", String(todayOrders.length)],
          ["Total Sales", `$${totalSales.toFixed(2)}`],
          [
            "Pending Orders",
            String(siteData.orders.filter((order) => order.status === "pending").length),
          ],
          ["Low Stock", String(lowStockCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-stone-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{label}</p>
            <p className="mt-3 text-4xl font-semibold text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[28px] border border-stone-200 bg-white p-8">
          <h2 className="text-3xl font-semibold text-stone-900">Latest Orders</h2>
          <div className="mt-6 space-y-4">
            {siteData.orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-[22px] border border-stone-200 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-stone-900">{order.orderNo}</p>
                  <p className="text-sm text-stone-500">{order.customerEmail}</p>
                </div>
                <div className="text-sm text-stone-600">
                  <p>{order.status}</p>
                  <p>${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-stone-200 bg-white p-8">
          <h2 className="text-3xl font-semibold text-stone-900">Low Stock Alerts</h2>
          <div className="mt-6 space-y-4">
            {siteData.products
              .filter((product) => product.stockQty <= product.lowStockThreshold)
              .map((product) => (
                <div key={product.id} className="rounded-[22px] border border-stone-200 p-5">
                  <p className="text-lg font-semibold text-stone-900">{product.name}</p>
                  <p className="text-sm text-stone-500">
                    {product.stockQty} left / threshold {product.lowStockThreshold}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
