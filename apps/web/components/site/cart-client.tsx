"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { formatUiText, localizeProduct, localizeSimpleText, t } from "@/lib/i18n";
import {
  calculateCartTotals,
  getApplicableShippingMethods,
  getMaxPurchasableQuantity,
  getProductPricing,
  resolveDiscountCode,
} from "@/lib/storefront";
import { formatMoney } from "@/lib/ui";
import type { DiscountCode, Product, ShippingMethod, SiteSettings } from "@/lib/types";

export function CartClient({
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
  const {
    items,
    removeItem,
    updateQuantity,
    shippingMethodId,
    setShippingMethodId,
    discountCode,
    setDiscountCode,
  } = useCart();
  const { currency, locale } = usePreferences();
  // `null` means the shopper has not edited the field yet, so the input mirrors
  // the applied code and picks up changes made elsewhere (for example applying a
  // code from the cart drawer) without an effect that writes state.
  const [draftOverride, setDraftOverride] = useState<string | null>(null);
  const draftDiscountCode = draftOverride ?? discountCode;
  const [discountMessage, setDiscountMessage] = useState("");

  const enabledShippingMethods = useMemo(
    () =>
      getApplicableShippingMethods(items, shippingMethods).toSorted(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    [items, shippingMethods],
  );
  const shippingMethod =
    enabledShippingMethods.find((method) => method.id === shippingMethodId) ?? enabledShippingMethods[0];
  const baseTotals = shippingMethod
    ? calculateCartTotals(items, products, shippingMethod, settings.freeShippingThreshold)
    : null;
  const totals = shippingMethod
    ? calculateCartTotals(
        items,
        products,
        shippingMethod,
        settings.freeShippingThreshold,
        discountCodes,
        discountCode,
      )
    : null;

  useEffect(() => {
    if (!shippingMethodId && enabledShippingMethods[0]) {
      setShippingMethodId(enabledShippingMethods[0].id);
    }
  }, [enabledShippingMethods, setShippingMethodId, shippingMethodId]);

  function applyDiscount() {
    const result = resolveDiscountCode(discountCodes, draftDiscountCode, baseTotals?.subtotal ?? 0);
    if (!result.code) {
      setDiscountMessage(result.message ?? t(locale, "discountInvalid"));
      return;
    }

    setDiscountCode(result.code.code);
    setDraftOverride(null);
    setDiscountMessage(t(locale, "discountApplied"));
  }

  function removeDiscount() {
    setDraftOverride(null);
    setDiscountCode("");
    setDiscountMessage("");
  }

  const freeShippingText = totals?.subtotal
    ? Math.max(0, settings.freeShippingThreshold - totals.subtotal) > 0
      ? formatUiText(locale, "freeShippingRemaining", {
          amount: formatMoney(Math.max(0, settings.freeShippingThreshold - totals.subtotal), currency),
        })
      : t(locale, "freeShippingUnlocked")
    : formatUiText(locale, "freeShippingOver", {
        amount: formatMoney(settings.freeShippingThreshold, currency),
      });
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px] lg:px-8">
      <section className="rounded-[30px] border border-stone-200 bg-white p-8">
        <h1 className="text-4xl font-semibold text-stone-900">{t(locale, "cart")}</h1>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-stone-600">{t(locale, "emptyCart")}</p>
          ) : (
            items.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId);
              if (!product) return null;
              const localizedProduct = localizeProduct(product, locale);
              const pricing = getProductPricing(product, item.variantId);
              const effectivePricingMode =
                item.pricingMode === "box" && pricing.hasPackPricing ? "box" : "piece";
              const unitPrice =
                effectivePricingMode === "box" ? pricing.boxPrice : pricing.piecePrice;
              const calculatedPieces =
                effectivePricingMode === "box"
                  ? item.quantity * pricing.packQuantity
                  : item.quantity;
              return (
                <div
                  key={`${item.productId}-${item.variantId ?? "base"}-${effectivePricingMode}`}
                  className="flex flex-col gap-4 rounded-[22px] border border-stone-200 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-stone-900">
                      {localizedProduct.name}
                    </p>
                    {pricing.variant?.name ? (
                      <p className="text-sm text-stone-500">{pricing.variant.name}</p>
                    ) : null}
                    <p className="text-sm text-stone-500">
                      {effectivePricingMode === "box" ? t(locale, "boxLabel") : t(locale, "pieceLabel")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-900">
                      {formatMoney(unitPrice, currency)}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {t(locale, "lineSubtotal")}: {formatMoney(unitPrice * item.quantity, currency)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatMoney(pricing.piecePrice, currency)} / {t(locale, "pieceLabel")}
                      {pricing.hasPackPricing
                        ? ` · ${formatMoney(pricing.boxPrice, currency)} / ${t(locale, "boxLabel")} ${formatUiText(locale, "piecesPerPackValue", {
                            count: String(pricing.packQuantity),
                          })}`
                        : ""}
                    </p>
                    {effectivePricingMode === "box" ? (
                      <p className="mt-1 text-xs text-stone-500">
                        {formatUiText(locale, "packEqualsPieces", {
                          count: String(pricing.packQuantity),
                        })} · {calculatedPieces} {t(locale, "piecesUnit")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-stone-200">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.pricingMode,
                            item.variantId,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="flex min-h-11 min-w-11 items-center justify-center text-lg text-stone-700"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={
                          getMaxPurchasableQuantity(product, item.pricingMode, item.variantId) ||
                          undefined
                        }
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(
                            item.productId,
                            item.pricingMode,
                            item.variantId,
                            Math.max(
                              1,
                              Math.min(
                                getMaxPurchasableQuantity(product, item.pricingMode, item.variantId) ||
                                  Number(event.target.value),
                                Number(event.target.value) || 1,
                              ),
                            ),
                          )
                        }
                        className="h-11 w-20 border-x border-stone-200 px-3 text-center"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.pricingMode,
                            item.variantId,
                            Math.min(
                              getMaxPurchasableQuantity(product, item.pricingMode, item.variantId) ||
                                item.quantity + 1,
                              item.quantity + 1,
                            ),
                          )
                        }
                        className="flex min-h-11 min-w-11 items-center justify-center text-lg text-stone-700"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.pricingMode, item.variantId)}
                      className="min-h-11 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
                    >
                      {t(locale, "remove")}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-900">{t(locale, "discountCode")}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  value={draftDiscountCode}
                  onChange={(event) => setDraftOverride(event.target.value)}
                  placeholder={t(locale, "discountPlaceholder")}
                  className="min-h-11 flex-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t(locale, "applyDiscount")}
                </button>
                {discountCode ? (
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="min-h-11 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
                  >
                    {t(locale, "removeDiscount")}
                  </button>
                ) : null}
              </div>
              {discountMessage ? <p className="mt-3 text-sm text-stone-600">{discountMessage}</p> : null}
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-900">{t(locale, "shippingMethodLabel")}</p>
              <div className="mt-3 space-y-3">
                {enabledShippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      shippingMethod?.id === method.id
                        ? "border-stone-950 bg-stone-950 text-white"
                        : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type="radio"
                        className="mt-1"
                        checked={shippingMethod?.id === method.id}
                        onChange={() => setShippingMethodId(method.id)}
                      />
                      <span>
                        <span className="block font-semibold">{localizeSimpleText(method.name, locale)}</span>
                        <span className="mt-1 block text-xs opacity-80">
                          {localizeSimpleText(method.description, locale)}
                        </span>
                      </span>
                    </span>
                    <span className="font-semibold">{formatMoney(method.price, currency)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="rounded-[30px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">{t(locale, "summary")}</h2>
        <div className="mt-6 space-y-3 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>{t(locale, "subtotal")}</span>
            <span>{formatMoney(totals?.subtotal ?? 0, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t(locale, "shippingMethodLabel")}</span>
            <span>{formatMoney(totals?.shipping ?? 0, currency)}</span>
          </div>
          {totals?.discount ? (
            <div className="flex justify-between text-emerald-800">
              <span>{t(locale, "discountLabel")}</span>
              <span>-{formatMoney(totals.discount, currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
            <span>{t(locale, "total")}</span>
            <span>{formatMoney(totals?.total ?? 0, currency)}</span>
          </div>
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-stone-400">
          {freeShippingText}
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
        >
          {t(locale, "proceedCheckout")}
        </Link>
      </aside>
    </div>
  );
}
