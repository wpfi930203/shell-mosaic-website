"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  calculateCartTotals,
  getApplicableShippingMethods,
  getMaxPurchasableQuantity,
  getProductPricing,
  resolveDiscountCode,
} from "@/lib/storefront";
import { formatUiText, localizeProduct, t } from "@/lib/i18n";
import { formatMoney } from "@/lib/ui";
import type { DiscountCode, Product, ShippingMethod, SiteSettings } from "@/lib/types";

export function CartDrawer({
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
    shippingMethodId,
    discountCode,
    isDrawerOpen,
    setShippingMethodId,
    setDiscountCode,
    updateQuantity,
    removeItem,
    closeDrawer,
  } = useCart();
  const { currency, locale } = usePreferences();
  // `null` means the shopper has not edited the field yet, so the input mirrors
  // the applied code and picks up changes made elsewhere (for example applying a
  // code on the cart page) without an effect that writes state.
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

  const activeShippingMethod =
    enabledShippingMethods.find((method) => method.id === shippingMethodId) ??
    enabledShippingMethods[0];
  const baseTotals = activeShippingMethod
    ? calculateCartTotals(items, products, activeShippingMethod, settings.freeShippingThreshold)
    : null;
  const totals =
    activeShippingMethod && items.length > 0
      ? calculateCartTotals(
          items,
          products,
          activeShippingMethod,
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

  function clearDiscount() {
    setDraftOverride(null);
    setDiscountCode("");
    setDiscountMessage("");
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isDrawerOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-stone-950/35 transition ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
        aria-label={t(locale, "closeCart")}
      />

      <aside
        className={`absolute bottom-0 left-0 right-0 max-h-[82vh] rounded-t-[28px] border border-stone-200 bg-white transition duration-300 lg:bottom-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[420px] lg:rounded-none lg:border-l ${
          isDrawerOpen
            ? "translate-y-0 lg:translate-x-0"
            : "translate-y-full lg:translate-x-full lg:translate-y-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                {t(locale, "cart")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-stone-900">
                {formatUiText(locale, "cartItemsCount", { count: String(items.length) })}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 text-stone-700"
              aria-label={t(locale, "closeCart")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {items.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-stone-600">{t(locale, "emptyCart")}</p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-11 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
                >
                  {t(locale, "continueShopping")}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item) => {
                  const product = products.find((candidate) => candidate.id === item.productId);
                  if (!product) {
                    return null;
                  }

                  const localizedProduct = localizeProduct(product, locale);
                  const pricing = getProductPricing(product, item.variantId);
                  const unitPrice =
                    item.pricingMode === "box" && pricing.hasPackPricing
                      ? pricing.boxPrice
                      : item.pricingMode === "sample" && pricing.hasSamplePricing
                        ? pricing.samplePrice
                        : pricing.piecePrice;
                  const previewImage =
                    pricing.variant?.images?.[0]?.path || product.images[0]?.path || "";
                  const maxQuantity = getMaxPurchasableQuantity(product, item.pricingMode, item.variantId);

                  return (
                    <div
                      key={`${item.productId}-${item.variantId ?? "base"}-${item.pricingMode}`}
                      className="rounded-[22px] border border-stone-200 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-[18px] bg-stone-100">
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt={localizedProduct.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-stone-900">
                            {localizedProduct.name}
                          </p>
                          {pricing.variant?.name ? (
                            <p className="mt-1 text-xs text-stone-500">{pricing.variant.name}</p>
                          ) : null}
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone-500">
                            {item.pricingMode === "box"
                              ? formatUiText(locale, "buyPerBoxPieces", {
                                  count: String(pricing.packQuantity),
                                })
                              : item.pricingMode === "sample"
                                ? t(locale, "orderSample")
                                : t(locale, "buyPerSheet")}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-stone-900">
                            {formatMoney(unitPrice, currency)}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {t(locale, "lineSubtotal")}:{" "}
                            {formatMoney(unitPrice * item.quantity, currency)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
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
                            max={maxQuantity || undefined}
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(
                                item.productId,
                                item.pricingMode,
                                item.variantId,
                                Math.min(
                                  maxQuantity || Number(event.target.value) || 1,
                                  Math.max(1, Number(event.target.value) || 1),
                                ),
                              )
                            }
                            className="h-11 w-14 border-x border-stone-200 text-center text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.pricingMode,
                                item.variantId,
                                maxQuantity > 0 ? Math.min(maxQuantity, item.quantity + 1) : item.quantity,
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
                })}

                <div className="rounded-[22px] border border-stone-200 p-4">
                  <p className="text-sm font-semibold text-stone-900">{t(locale, "discountCode")}</p>
                  <div className="mt-3 flex gap-2">
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
                  </div>
                  {discountCode ? (
                    <button
                      type="button"
                      onClick={clearDiscount}
                      className="mt-3 text-sm font-semibold text-stone-700 underline"
                    >
                      {t(locale, "removeDiscount")}
                    </button>
                  ) : null}
                  {discountMessage ? <p className="mt-2 text-sm text-stone-600">{discountMessage}</p> : null}
                </div>

                <div className="rounded-[22px] border border-stone-200 p-4">
                  <p className="text-sm font-semibold text-stone-900">{t(locale, "shippingMethodLabel")}</p>
                  <div className="mt-3 space-y-2">
                    {enabledShippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                          activeShippingMethod?.id === method.id
                            ? "border-stone-950 bg-stone-950 text-white"
                            : "border-stone-200 bg-white text-stone-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="drawer-shipping"
                          className="mt-1"
                          checked={activeShippingMethod?.id === method.id}
                          onChange={() => setShippingMethodId(method.id)}
                        />
                        <span className="flex-1">
                          <span className="block font-semibold">{method.name}</span>
                          <span className="mt-1 block text-xs opacity-80">{method.description}</span>
                        </span>
                        <span className="font-semibold">{formatMoney(method.price, currency)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 px-5 py-4">
            <div className="space-y-2 text-sm text-stone-600">
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

            <div className="mt-4 grid gap-3">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
              >
                {t(locale, "viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t(locale, "proceedCheckout")}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
