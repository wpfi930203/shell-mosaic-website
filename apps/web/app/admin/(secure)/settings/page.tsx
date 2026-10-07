"use client";

import { useSiteData } from "@/components/admin/use-site-data";

export default function AdminSettingsPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">
          Global site, shipping and PayPal configuration.
        </h1>
        <p className="mt-3 text-sm text-stone-500">{status}</p>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Store Basics</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                value={data.settings.brandName}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: { ...data.settings, brandName: event.target.value },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Brand name"
              />
              <input
                value={data.settings.storeName}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: { ...data.settings, storeName: event.target.value },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Store name"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-stone-900">Payment Methods</h2>
            <p className="mt-2 text-sm text-stone-500">
              Enable PayPal and direct credit card checkout. Credit card payments are processed
              through PayPal card fields, so customers do not need to log in to PayPal.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.settings.paypalEnabled}
                  onChange={(event) =>
                    save({
                      ...data,
                      settings: {
                        ...data.settings,
                        paypalEnabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable PayPal wallet payment
              </label>
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.settings.creditCardEnabled}
                  onChange={(event) =>
                    save({
                      ...data,
                      settings: {
                        ...data.settings,
                        creditCardEnabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable direct credit card payment
              </label>
              <input
                value={data.settings.paypalMerchantEmail}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      paypalMerchantEmail: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="PayPal merchant email"
              />
              <input
                value={data.settings.paypalClientId}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      paypalClientId: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="PayPal Client ID"
              />
              <input
                value={data.settings.paypalClientSecret}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      paypalClientSecret: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
                placeholder="PayPal Client Secret"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-stone-900">Shipping</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                type="number"
                value={data.settings.freeShippingThreshold}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      freeShippingThreshold: Number(event.target.value),
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Free shipping threshold"
              />
              <input
                value={data.settings.vatLabel}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      vatLabel: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="VAT included"
              />
              <input
                value={data.settings.shippingPromotionText}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      shippingPromotionText: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
                placeholder="Spend {amount} more to get free shipping."
              />
              <input
                value={data.settings.purchaseAdviceText}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      purchaseAdviceText: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
                placeholder="We recommend adding 10% extra for cuts and breakages."
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-stone-900">Email Notifications</h2>
            <p className="mt-2 text-sm text-stone-500">
              These addresses are used to prepare order confirmation and internal order notice
              logs. You can replace them later with your production sender inbox.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={data.settings.orderNotificationsEnabled}
                  onChange={(event) =>
                    save({
                      ...data,
                      settings: {
                        ...data.settings,
                        orderNotificationsEnabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable confirmation and admin notice emails
              </label>
              <input
                value={data.settings.checkoutSupportEmail}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      checkoutSupportEmail: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Customer support email"
              />
              <input
                value={data.settings.notificationSenderEmail}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      notificationSenderEmail: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Sender email"
              />
              <input
                value={data.settings.notificationReplyToEmail}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      notificationReplyToEmail: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="Reply-to email"
              />
              <input
                value={data.settings.orderNotificationRecipient}
                onChange={(event) =>
                  save({
                    ...data,
                    settings: {
                      ...data.settings,
                      orderNotificationRecipient: event.target.value,
                    },
                  })
                }
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
                placeholder="Internal notification recipient"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
