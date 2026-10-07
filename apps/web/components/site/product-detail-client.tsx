"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { formatUiText, localizeProduct, localizeSimpleText, t } from "@/lib/i18n";
import {
  getMaxPurchasableQuantity,
  getProductPricing,
  getUnitPrice,
} from "@/lib/storefront";
import { formatMoney } from "@/lib/ui";
import type {
  Product,
  ProductReview,
  PurchaseMode,
  SiteSettings,
} from "@/lib/types";

export function ProductDetailClient({
  product,
  reviews,
  settings,
}: {
  product: Product;
  reviews: ProductReview[];
  settings: SiteSettings;
}) {
  const { addItem } = useCart();
  const { currency, locale } = usePreferences();
  const localizedProduct = localizeProduct(product, locale);
  const enabledVariants = (product.variants ?? []).filter((variant) => variant.enabled);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    enabledVariants.find((variant) => variant.isDefault)?.id ?? enabledVariants[0]?.id ?? "",
  );
  const selectedVariant = useMemo(
    () => enabledVariants.find((variant) => variant.id === selectedVariantId),
    [enabledVariants, selectedVariantId],
  );
  const pricing = getProductPricing(product, selectedVariantId || undefined);
  const galleryImages = useMemo(
    () =>
      (selectedVariant?.images?.length ? selectedVariant.images : product.images).toSorted(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [product.images, selectedVariant],
  );
  // Derived from the active variant's gallery so switching variant (or an empty
  // gallery) can never leave a stale image selected.
  const [manualImageId, setManualImageId] = useState<string | null>(null);
  const selectedImage =
    galleryImages.find((image) => image.id === manualImageId) ?? galleryImages[0];
  const purchaseOptions = useMemo<{ mode: PurchaseMode; label: string }[]>(() => {
    const options: { mode: PurchaseMode; label: string }[] = [
      { mode: "piece", label: t(locale, "buyPerSheet") },
    ];

    if (pricing.hasPackPricing) {
      options.push({
        mode: "box",
        label: formatUiText(locale, "buyPerBoxPieces", {
          count: String(pricing.packQuantity),
        }),
      });
    }

    if (pricing.hasSamplePricing) {
      options.push({
        mode: "sample",
        label: product.sampleLabel?.trim() || t(locale, "orderSample"),
      });
    }

    return options;
  }, [
    locale,
    pricing.hasPackPricing,
    pricing.hasSamplePricing,
    pricing.packQuantity,
    product.sampleLabel,
  ]);
  const [requestedPurchaseMode, setRequestedPurchaseMode] = useState<PurchaseMode>(
    pricing.hasPackPricing ? "box" : "piece",
  );
  // Corrected during render instead of in an effect: a mode the active variant
  // cannot honour (for example "box" after switching to a finish without pack
  // pricing) falls back immediately, without an extra render pass.
  const purchaseMode: PurchaseMode =
    requestedPurchaseMode === "box" && !pricing.hasPackPricing
      ? "piece"
      : requestedPurchaseMode === "sample" && !pricing.hasSamplePricing
        ? pricing.hasPackPricing
          ? "box"
          : "piece"
        : requestedPurchaseMode;
  // Quantity is remembered per pricing mode, so switching mode starts again at 1
  // while an unrelated re-render keeps the shopper's number.
  const [quantityByMode, setQuantityByMode] = useState<Partial<Record<PurchaseMode, number>>>({});
  const quantity = quantityByMode[purchaseMode] ?? 1;
  const [cartMessage, setCartMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    orderId: "",
    email: "",
    customerName: "",
    rating: 5,
    content: "",
  });
  const [message, setMessage] = useState("");

  const approvedReviews = useMemo(
    () => reviews.filter((review) => review.status === "approved"),
    [reviews],
  );

  const maxQuantity = getMaxPurchasableQuantity(product, purchaseMode, selectedVariantId || undefined);
  const unitPrice = getUnitPrice(product, purchaseMode, selectedVariantId || undefined);
  const subtotal = unitPrice * quantity;
  const stockMessage =
    maxQuantity > 0 ? t(locale, "inStockReady") : t(locale, "outOfStockLabel");
  const compareAtPrice = pricing.compareAtPrice > unitPrice ? pricing.compareAtPrice : 0;
  const shippingPromotionAmount = Math.max(0, settings.freeShippingThreshold - subtotal);
  const shippingPromotionText =
    shippingPromotionAmount > 0
      ? (settings.shippingPromotionText || t(locale, "shippingPromoDefault")).replace(
          "{amount}",
          formatMoney(shippingPromotionAmount, currency),
        )
      : t(locale, "freeShippingUnlocked");

  async function submitReview() {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        ...reviewForm,
      }),
    });

    const payload = (await response.json()) as { message?: string };
    setMessage(response.ok ? t(locale, "reviewSubmitted") : payload.message ?? t(locale, "failed"));
  }

  function changeQuantity(nextQuantity: number) {
    const safeMax = Math.max(1, maxQuantity || 1);
    setQuantityByMode((current) => ({
      ...current,
      [purchaseMode]: Math.min(safeMax, Math.max(1, nextQuantity)),
    }));
  }

  function handleAddToCart() {
    if (maxQuantity <= 0) {
      setCartMessage(t(locale, "outOfStockLabel"));
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariantId || undefined,
      pricingMode: purchaseMode,
      quantity,
    });
    setCartMessage(t(locale, "addedToCart"));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-[34px] border border-stone-200 bg-white">
            {selectedImage ? (
              <Image
                src={selectedImage.path}
                alt={selectedImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">
                No image available
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {galleryImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setManualImageId(image.id)}
                  className="relative aspect-square overflow-hidden rounded-[20px] border border-stone-200 bg-white"
                >
                  <Image
                    src={image.path}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-stone-200 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{pricing.sku}</p>
          <h1 className="mt-3 text-5xl leading-tight font-semibold text-stone-900">
            {localizedProduct.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-600">
            {localizedProduct.shortDescription}
          </p>
          {enabledVariants.length > 0 ? (
            <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-900">Variant</p>
              <p className="mt-1 text-sm text-stone-500">
                Choose the exact product option before adding it to cart.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {enabledVariants.map((variant) => {
                  const active = variant.id === selectedVariantId;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold ${
                        active
                          ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                          : "border-stone-300 text-stone-700"
                      }`}
                    >
                      {variant.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-6 rounded-[28px] border border-stone-200 bg-stone-50 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {settings.vatLabel || "VAT included"}
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <p className="text-4xl font-semibold text-stone-900">
                    {formatMoney(unitPrice, currency)}
                  </p>
                  {compareAtPrice ? (
                    <p className="text-lg text-stone-400 line-through">
                      {formatMoney(compareAtPrice, currency)}
                    </p>
                  ) : null}
                  {compareAtPrice ? (
                    <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                      {formatUiText(locale, "savePercent", {
                        percent: String(
                          Math.round(((compareAtPrice - unitPrice) / compareAtPrice) * 100),
                        ),
                      })}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-stone-500">
                  {purchaseMode === "box"
                    ? `${formatMoney(pricing.boxPrice, currency)} / ${t(locale, "boxLabel")}`
                    : purchaseMode === "sample"
                      ? `${formatMoney(pricing.samplePrice, currency)} / ${t(locale, "sampleLabel")}`
                      : `${formatMoney(pricing.piecePrice, currency)} / ${t(locale, "pieceLabel")}`}
                </p>
              </div>
              <div
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  maxQuantity > 0
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {stockMessage}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {purchaseOptions.map((option) => {
                const active = option.mode === purchaseMode;
                return (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => {
                      setQuantityByMode((current) => ({ ...current, [option.mode]: 1 }));
                      setRequestedPurchaseMode(option.mode);
                    }}
                    className={`min-h-11 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                      active
                        ? "border-stone-950 bg-stone-950 text-white"
                        : "border-stone-300 bg-white text-stone-700"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-end">
              <div>
                <p className="text-sm font-semibold text-stone-900">{t(locale, "quantityLabel")}</p>
                <div className="mt-2 flex items-center rounded-full border border-stone-200 bg-white">
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity - 1)}
                    className="flex min-h-11 min-w-11 items-center justify-center text-lg text-stone-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQuantity || undefined}
                    value={quantity}
                    onChange={(event) => changeQuantity(Number(event.target.value))}
                    className="h-11 w-20 border-x border-stone-200 text-center text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => changeQuantity(quantity + 1)}
                    className="flex min-h-11 min-w-11 items-center justify-center text-lg text-stone-700"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  {formatUiText(locale, "maxQuantityHint", {
                    count: String(maxQuantity),
                  })}
                </p>
              </div>

              <div className="rounded-[24px] bg-white p-4">
                <p className="text-sm text-stone-500">{t(locale, "lineSubtotal")}</p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">
                  {formatMoney(subtotal, currency)}
                </p>
                {pricing.hasPackPricing ? (
                  <p className="mt-2 text-xs text-stone-500">
                    {formatUiText(locale, "packEqualsPieces", {
                      count: String(pricing.packQuantity),
                    })}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-[22px] bg-white p-4 text-sm text-stone-600">
              <p>{shippingPromotionText}</p>
              <p>{settings.purchaseAdviceText || t(locale, "purchaseAdviceDefault")}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={maxQuantity <= 0}
                className="min-h-11 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(locale, "addToCart")}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddToCart();
                  if (maxQuantity > 0) {
                    window.location.href = "/checkout";
                  }
                }}
                disabled={maxQuantity <= 0}
                className="min-h-11 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t(locale, "buyNow")}
              </button>
            </div>
            {cartMessage ? <p className="mt-3 text-sm text-emerald-900">{cartMessage}</p> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.materials.concat(product.patterns, product.colors, product.applications).map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600"
                >
                  {localizeSimpleText(tag, locale)}
                </span>
              ),
            )}
          </div>
          <div className="prose-rich mt-8 text-sm leading-7 text-stone-700">
            <div dangerouslySetInnerHTML={{ __html: localizedProduct.descriptionHtml }} />
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[30px] border border-stone-200 bg-white p-8">
          <h2 className="text-3xl font-semibold text-stone-900">
            {t(locale, "customerReviews")}
          </h2>
          <div className="mt-6 space-y-4">
            {approvedReviews.map((review) => (
              <article key={review.id} className="rounded-[24px] border border-stone-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {review.customerName}
                    </p>
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                      {t(locale, "verifiedPurchase")}
                    </p>
                  </div>
                  <p className="text-sm text-stone-500">{`${review.rating}/5`}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-600">{review.content}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-stone-200 bg-white p-8">
          <h2 className="text-3xl font-semibold text-stone-900">
            {t(locale, "submitReview")}
          </h2>
          <div className="mt-5 space-y-3">
            <input
              placeholder={t(locale, "orderId")}
              className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
              value={reviewForm.orderId}
              onChange={(event) =>
                setReviewForm((current) => ({ ...current, orderId: event.target.value }))
              }
            />
            <input
              placeholder={t(locale, "email")}
              className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
              value={reviewForm.email}
              onChange={(event) =>
                setReviewForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <input
              placeholder={t(locale, "name")}
              className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
              value={reviewForm.customerName}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  customerName: event.target.value,
                }))
              }
            />
            <select
              value={reviewForm.rating}
              onChange={(event) =>
                setReviewForm((current) => ({
                  ...current,
                  rating: Number(event.target.value),
                }))
              }
              className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} {t(locale, "star")}
                </option>
              ))}
            </select>
            <textarea
              placeholder={t(locale, "reviewLabel")}
              rows={5}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              value={reviewForm.content}
              onChange={(event) =>
                setReviewForm((current) => ({ ...current, content: event.target.value }))
              }
            />
            <button
              type="button"
              onClick={submitReview}
              className="min-h-11 w-full rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
            >
              {t(locale, "submitForApproval")}
            </button>
            {message ? <p className="text-sm text-stone-600">{message}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
