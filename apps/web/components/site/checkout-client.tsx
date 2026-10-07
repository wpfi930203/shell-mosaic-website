"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/providers/cart-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { formatUiText, localizeSimpleText, t } from "@/lib/i18n";
import { calculateCartTotals, getApplicableShippingMethods, getProductPricing } from "@/lib/storefront";
import { formatMoney } from "@/lib/ui";
import type {
  Address,
  DiscountCode,
  PaymentMethod,
  Product,
  ShippingMethod,
  SiteSettings,
} from "@/lib/types";

export function CheckoutClient({
  products,
  shippingMethods,
  discountCodes,
  settings,
}: {
  products: Product[];
  shippingMethods: ShippingMethod[];
  discountCodes: DiscountCode[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const { items, clearCart, shippingMethodId, setShippingMethodId, discountCode, setDiscountCode } = useCart();
  const { currency, locale } = usePreferences();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    settings.paypalEnabled ? "paypal" : "credit_card",
  );
  const [form, setForm] = useState<Address>({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeMethod = useMemo(
    () => shippingMethods.find((method) => method.id === shippingMethodId) ?? shippingMethods[0],
    [shippingMethodId, shippingMethods],
  );
  const sortedShippingMethods = useMemo(
    () =>
      getApplicableShippingMethods(items, shippingMethods).toSorted(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    [items, shippingMethods],
  );

  const totals = calculateCartTotals(
    items,
    products,
    activeMethod,
    settings.freeShippingThreshold,
    discountCodes,
    discountCode,
  );
  const paypalConfigured = Boolean(
    settings.paypalMerchantEmail && settings.paypalClientId && settings.paypalClientSecret,
  );
  const paymentMethods = [
    settings.paypalEnabled ? "paypal" : null,
    settings.creditCardEnabled ? "credit_card" : null,
  ].filter(Boolean) as PaymentMethod[];

  useEffect(() => {
    if (!shippingMethodId && sortedShippingMethods[0]) {
      setShippingMethodId(sortedShippingMethods[0].id);
    }
  }, [setShippingMethodId, shippingMethodId, sortedShippingMethods]);

  // Derived rather than corrected inside an effect: if the admin disables the
  // method the shopper had picked, the selection falls back without an extra
  // render pass, and the fallback is what reaches the order payload.
  const effectivePaymentMethod = paymentMethods.includes(paymentMethod)
    ? paymentMethod
    : (paymentMethods[0] ?? "paypal");

  async function submitOrder() {
    setSubmitting(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.fullName,
        customerEmail: form.email,
        shippingAddress: form,
        items,
        shippingMethodId: activeMethod.id,
        paymentMethod: effectivePaymentMethod,
        currency,
        discountCode,
      }),
    });

    const payload = (await response.json()) as { orderNo?: string };
    if (!response.ok) {
      setResult(t(locale, "orderSubmissionFailed"));
      setSubmitting(false);
      return;
    }

    setDiscountCode("");
    clearCart();
    setResult(formatUiText(locale, "orderCreated", { orderNo: payload.orderNo ?? "-" }));
    router.push(`/checkout/confirmation?orderNo=${encodeURIComponent(payload.orderNo ?? "")}`);
  }

  const isFormValid = Boolean(
    form.fullName &&
      form.email &&
      form.phone &&
      form.addressLine1 &&
      form.city &&
      form.postalCode &&
      form.country &&
      activeMethod?.id &&
      paymentMethods.length,
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px] lg:px-8">
      <section className="rounded-[30px] border border-stone-200 bg-white p-8">
        <h1 className="text-4xl font-semibold text-stone-900">{t(locale, "checkout")}</h1>
        <div className="mt-6 space-y-6">
          <div className="rounded-[24px] border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t(locale, "stepShippingAddress")}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                value={form.fullName}
                placeholder={t(locale, "fullName")}
                onChange={(value) => setForm((current) => ({ ...current, fullName: value }))}
              />
              <Field
                value={form.email}
                placeholder={t(locale, "email")}
                onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              />
              <Field
                value={form.phone}
                placeholder={t(locale, "phone")}
                onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
              />
              <Field
                value={form.country}
                placeholder={t(locale, "countryLabel")}
                onChange={(value) => setForm((current) => ({ ...current, country: value }))}
              />
              <Field
                value={form.addressLine1}
                placeholder={t(locale, "addressLine1")}
                onChange={(value) => setForm((current) => ({ ...current, addressLine1: value }))}
                className="md:col-span-2"
              />
              <Field
                value={form.addressLine2}
                placeholder={t(locale, "addressLine2")}
                onChange={(value) => setForm((current) => ({ ...current, addressLine2: value }))}
                className="md:col-span-2"
              />
              <Field
                value={form.city}
                placeholder={t(locale, "cityLabel")}
                onChange={(value) => setForm((current) => ({ ...current, city: value }))}
              />
              <Field
                value={form.state}
                placeholder={t(locale, "stateLabel")}
                onChange={(value) => setForm((current) => ({ ...current, state: value }))}
              />
              <Field
                value={form.postalCode}
                placeholder={t(locale, "postalCode")}
                onChange={(value) => setForm((current) => ({ ...current, postalCode: value }))}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t(locale, "stepShippingMethod")}</p>
            <div className="mt-4 space-y-3">
              {sortedShippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border px-4 py-3 ${
                    activeMethod?.id === method.id
                      ? "border-stone-950 bg-stone-950 text-white"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <span className="flex gap-3">
                    <input
                      type="radio"
                      className="mt-1"
                      checked={activeMethod?.id === method.id}
                      onChange={() => setShippingMethodId(method.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold">{localizeSimpleText(method.name, locale)}</span>
                      <span className="mt-1 block text-xs opacity-80">
                        {localizeSimpleText(method.description, locale)}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{formatMoney(method.price, currency)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t(locale, "stepPayment")}</p>
            <p className="mt-3 text-sm font-semibold text-stone-900">{t(locale, "paymentMethodLabel")}</p>
            <p className="mt-1 text-sm text-stone-500">{t(locale, "paymentChoiceHint")}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {paymentMethods.map((method) => {
                const active = effectivePaymentMethod === method;
                const label =
                  method === "paypal" ? t(locale, "paypalOption") : t(locale, "creditCardOption");

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`min-h-11 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "border-stone-950 bg-stone-950 text-white"
                        : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[24px] border border-stone-200 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t(locale, "stepConfirm")}</p>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <div className="flex justify-between gap-4">
                <span>{t(locale, "paymentMethodLabel")}</span>
                <span>{effectivePaymentMethod === "paypal" ? t(locale, "paypalOption") : t(locale, "creditCardOption")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>{t(locale, "shippingMethodLabel")}</span>
                <span>{activeMethod?.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>{t(locale, "discountCode")}</span>
                <span>{discountCode || "-"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-stone-100 p-5 text-sm leading-7 text-stone-600">
            {paypalConfigured
              ? t(locale, "paypalConfiguredHint")
              : t(locale, "paypalSetupHint")}
          </div>
          <button
            type="button"
            onClick={submitOrder}
            disabled={items.length === 0 || !isFormValid || submitting}
            className="min-h-11 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? t(locale, "placingOrder") : t(locale, "confirmAndPlaceOrder")}
          </button>
          {result ? <p className="text-sm text-emerald-900">{result}</p> : null}
        </div>
      </section>

      <aside className="rounded-[30px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">
          {t(locale, "orderSummary")}
        </h2>
        <div className="mt-6 space-y-4 border-b border-stone-200 pb-5">
          {items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            if (!product) return null;
            const pricing = getProductPricing(product, item.variantId);
            const effectivePricingMode =
              item.pricingMode === "box" && pricing.hasPackPricing ? "box" : "piece";

            return (
              <div
                key={`${item.productId}-${item.variantId ?? "base"}-${item.pricingMode}`}
                className="text-sm text-stone-600"
              >
                <p className="font-semibold text-stone-900">{product.name}</p>
                {pricing.variant?.name ? <p className="mt-1">{pricing.variant.name}</p> : null}
                <p className="mt-1">
                  {item.quantity} x {effectivePricingMode === "box" ? t(locale, "boxLabel") : t(locale, "pieceLabel")}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatMoney(pricing.piecePrice, currency)} / {t(locale, "pieceLabel")}
                  {pricing.hasPackPricing
                    ? ` · ${formatMoney(pricing.boxPrice, currency)} / ${t(locale, "boxLabel")} ${formatUiText(locale, "piecesPerPackValue", {
                        count: String(pricing.packQuantity),
                      })}`
                    : ""}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 space-y-3 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>{t(locale, "subtotal")}</span>
            <span>{formatMoney(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t(locale, "shippingMethodLabel")}</span>
            <span>{formatMoney(totals.shipping, currency)}</span>
          </div>
          {totals.discount ? (
            <div className="flex justify-between text-emerald-800">
              <span>{t(locale, "discountLabel")}</span>
              <span>-{formatMoney(totals.discount, currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>{t(locale, "paymentMethodLabel")}</span>
            <span>
              {effectivePaymentMethod === "paypal"
                ? t(locale, "paypalOption")
                : t(locale, "creditCardOption")}
            </span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
            <span>{t(locale, "total")}</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  value,
  placeholder,
  onChange,
  className = "",
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <input
      placeholder={placeholder}
      className={`min-h-11 rounded-2xl border border-stone-200 px-4 py-3 ${className}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
