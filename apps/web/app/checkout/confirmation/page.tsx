import Link from "next/link";

import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function CheckoutConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string }>;
}) {
  const { orderNo } = await searchParams;
  const siteData = await readSiteData();
  const order = siteData.orders.find((candidate) => candidate.orderNo === orderNo);

  return (
    <SiteShell siteData={siteData}>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="rounded-[32px] border border-stone-200 bg-white p-8">
          {order ? (
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Order Confirmed</p>
                <h1 className="mt-2 text-4xl font-semibold text-stone-900">{order.orderNo}</h1>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Thank you for your order. We have saved your shipping details, selected shipping
                  method and payment choice. A confirmation notice has been prepared using the
                  email settings configured in admin.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[24px] bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-900">Shipping Address</p>
                  <div className="mt-3 space-y-1 text-sm text-stone-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.email}</p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
                    <p>
                      {order.shippingAddress.city}
                      {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                <div className="rounded-[24px] bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-stone-900">Payment & Delivery</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-600">
                    <p>Payment: {order.paymentMethod}</p>
                    <p>Shipping: {order.shippingMethodName}</p>
                    <p>Shipping amount: {order.currency} {order.shippingAmount.toFixed(2)}</p>
                    <p>Discount: {order.currency} {order.discountAmount.toFixed(2)}</p>
                    <p>Total: {order.currency} {order.totalAmount.toFixed(2)}</p>
                    <p>
                      Confirmation email:{" "}
                      {order.confirmationEmailSentAt
                        ? `logged at ${new Date(order.confirmationEmailSentAt).toLocaleString()}`
                        : "pending"}
                    </p>
                    {siteData.settings.checkoutSupportEmail ? (
                      <p>Support: {siteData.settings.checkoutSupportEmail}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-stone-200 p-5">
                <p className="text-sm font-semibold text-stone-900">Items</p>
                <div className="mt-4 space-y-3 text-sm text-stone-600">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.variantId ?? "base"}-${item.pricingMode}`} className="flex justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">{item.productName}</p>
                        <p>
                          {item.variantName ? `${item.variantName} · ` : ""}
                          {item.pricingMode} · Qty {item.quantity}
                        </p>
                      </div>
                      <p>
                        {order.currency} {(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/order-tracking"
                  className="flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
                >
                  Track Order
                </Link>
                <Link
                  href="/shop"
                  className="flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Order Confirmation</p>
              <h1 className="text-4xl font-semibold text-stone-900">Order not found</h1>
              <p className="text-sm text-stone-600">
                We could not find the requested order number. Please return to checkout or contact
                support.
              </p>
              <Link
                href="/checkout"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
              >
                Back to Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
