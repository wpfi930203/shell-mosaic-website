"use client";

import { useSiteData } from "@/components/admin/use-site-data";
import type { OrderStatus, ShippingMode, SiteData } from "@/lib/types";

const orderStatuses: OrderStatus[] = ["pending", "paid", "processing", "shipped", "completed"];

const shippingModeLabels: Record<ShippingMode, string> = {
  international_express: "International Express",
  air_freight: "Air Freight",
  sea_freight: "Sea Freight",
  sample_courier: "Sample Courier",
};

export default function AdminOrdersPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Orders</p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-900">
              Manage fulfillment and shipping updates.
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-stone-500">
              Update the order status, payment status, carrier, tracking number, tracking link and
              shipping notes. This is designed for common cross-border delivery workflows including
              international express, air freight and sea freight.
            </p>
          </div>
          <p className="text-sm text-stone-500">{status}</p>
        </div>
      </div>

      <div className="space-y-5">
        {data.orders
          .toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((order) => (
          <div key={order.id} className="rounded-[24px] border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-stone-900">{order.orderNo}</p>
                <p className="text-sm text-stone-500">
                  {order.customerName} · {order.customerEmail}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {order.shippingMethodName} · {shippingModeLabels[order.shippingMode]}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
                {order.currency} {order.totalAmount.toFixed(2)}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Order Status</span>
                <select
                  value={order.status}
                  onChange={(event) =>
                    updateOrder(data, save, order.id, {
                      status: event.target.value as OrderStatus,
                    })
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  {orderStatuses.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Payment Status</span>
                <select
                  value={order.paymentStatus}
                  onChange={(event) =>
                    updateOrder(data, save, order.id, {
                      paymentStatus: event.target.value as "pending" | "paid",
                    })
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Payment Method</span>
                <input
                  value={order.paymentMethod}
                  readOnly
                  className="min-h-11 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500"
                />
              </label>

              <Field
                label="Carrier"
                value={order.carrierName}
                onChange={(value) => updateOrder(data, save, order.id, { carrierName: value })}
                placeholder="DHL, UPS, FedEx, MSC, CMA CGM..."
              />
              <Field
                label="Tracking Number"
                value={order.trackingNumber}
                onChange={(value) => {
                  const shippingMethod = data.shippingMethods.find(
                    (method) => method.id === order.shippingMethodId,
                  );
                  const trackingUrl = buildTrackingUrl(
                    order.trackingUrl,
                    shippingMethod?.trackingUrlTemplate,
                    value,
                  );

                  updateOrder(data, save, order.id, {
                    trackingNumber: value,
                    trackingUrl,
                  });
                }}
                placeholder="Tracking or booking number"
              />
              <Field
                label="Tracking URL"
                value={order.trackingUrl}
                onChange={(value) => updateOrder(data, save, order.id, { trackingUrl: value })}
                placeholder="https://tracking.example.com/..."
              />

              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Shipped At</span>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(order.shippedAt)}
                  onChange={(event) =>
                    updateOrder(data, save, order.id, {
                      shippedAt: event.target.value ? new Date(event.target.value).toISOString() : "",
                    })
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-stone-800">Logistics Notes</span>
                <textarea
                  value={order.logisticsNotes}
                  onChange={(event) =>
                    updateOrder(data, save, order.id, { logisticsNotes: event.target.value })
                  }
                  rows={4}
                  placeholder="Example: palletized shipment, customs clearance in progress, vessel ETD/ETA, airway bill notes."
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                />
              </label>
            </div>

            <div className="mt-5 rounded-[20px] bg-stone-50 p-4 text-sm text-stone-600">
              <p className="font-semibold text-stone-900">Fulfillment Snapshot</p>
              <p className="mt-2">
                Shipping service: {order.shippingMethodName} ({order.shippingMethodDescription})
              </p>
              <p className="mt-1">Tracking mode: {shippingModeLabels[order.shippingMode]}</p>
              <p className="mt-1">
                Tracking link: {order.trackingUrl ? order.trackingUrl : "Not assigned yet"}
              </p>
              <p className="mt-1">
                Shipped at: {order.shippedAt ? new Date(order.shippedAt).toLocaleString() : "Not shipped yet"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function updateOrder(
  data: SiteData,
  save: (nextData: SiteData) => Promise<void>,
  orderId: string,
  patch: Partial<SiteData["orders"][number]>,
) {
  const nextOrders = data.orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order));
  void save({ ...data, orders: nextOrders });
}

function buildTrackingUrl(currentUrl: string, template: string | undefined, trackingNumber: string) {
  if (currentUrl) {
    return currentUrl;
  }

  if (!template || !trackingNumber) {
    return "";
  }

  return template.replace("{trackingNumber}", encodeURIComponent(trackingNumber));
}

function toDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
      />
    </label>
  );
}
