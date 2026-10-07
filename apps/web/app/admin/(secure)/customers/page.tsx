import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const siteData = await readSiteData();

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Customers</p>
      <h1 className="mt-2 text-4xl font-semibold text-stone-900">Customer overview.</h1>
      <div className="mt-6 space-y-4">
        {siteData.customers.map((customer) => {
          const orders = siteData.orders.filter((order) => order.customerEmail === customer.email);
          const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
          return (
            <div key={customer.id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-stone-900">{customer.name}</p>
                  <p className="text-sm text-stone-500">{customer.email}</p>
                </div>
                <div className="text-sm text-stone-600">
                  <p>Orders: {orders.length}</p>
                  <p>Total spent: ${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
