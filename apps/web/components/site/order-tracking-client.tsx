"use client";

import { useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { localizeOrderStatus, localizePaymentStatus, t } from "@/lib/i18n";
import type { Order, ShippingMode } from "@/lib/types";

export function OrderTrackingClient({ orders }: { orders: Order[] }) {
  const { locale } = usePreferences();
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");

  const order = orders.find(
    (candidate) =>
      candidate.orderNo.toLowerCase() === orderNo.toLowerCase() &&
      candidate.customerEmail.toLowerCase() === email.toLowerCase(),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="rounded-[30px] border border-stone-200 bg-white p-8">
        <h1 className="text-4xl font-semibold text-stone-900">
          {t(locale, "orderTracking")}
        </h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            placeholder={t(locale, "orderNumber")}
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            value={orderNo}
            onChange={(event) => setOrderNo(event.target.value)}
          />
          <input
            placeholder={t(locale, "email")}
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {order ? (
          <div className="mt-8 rounded-[24px] bg-stone-100 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {t(locale, "status")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">
                  {localizeOrderStatus(order.status, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {t(locale, "payment")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">
                  {localizePaymentStatus(order.paymentStatus, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {t(locale, "carrier")}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {order.carrierName || t(locale, "pendingAssignment")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {t(locale, "trackingNumberLabel")}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {order.trackingNumber || t(locale, "pendingAssignment")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {locale === "zh" ? "运输方式" : "Shipping Service"}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {order.shippingMethodName || t(locale, "pendingAssignment")}
                </p>
                <p className="mt-1 text-sm text-stone-500">{order.shippingMethodDescription}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {locale === "zh" ? "物流类型" : "Logistics Type"}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {localizeShippingMode(order.shippingMode, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {locale === "zh" ? "发货时间" : "Shipped At"}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {order.shippedAt ? new Date(order.shippedAt).toLocaleString() : t(locale, "pendingAssignment")}
                </p>
              </div>
            </div>

            {order.logisticsNotes ? (
              <div className="mt-6 rounded-[20px] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {locale === "zh" ? "物流备注" : "Logistics Notes"}
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-700">{order.logisticsNotes}</p>
              </div>
            ) : null}

            {order.trackingUrl ? (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {locale === "zh" ? "查看物流追踪" : "View Tracking"}
              </a>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm text-stone-500">
            {t(locale, "trackingHint")}
          </p>
        )}
      </div>
    </div>
  );
}

function localizeShippingMode(mode: ShippingMode, locale: string) {
  if (locale === "zh") {
    const labels: Record<ShippingMode, string> = {
      international_express: "国际快递",
      air_freight: "空运",
      sea_freight: "海运",
      sample_courier: "样品快递",
    };

    return labels[mode];
  }

  const labels: Record<ShippingMode, string> = {
    international_express: "International Express",
    air_freight: "Air Freight",
    sea_freight: "Sea Freight",
    sample_courier: "Sample Courier",
  };

  return labels[mode];
}
