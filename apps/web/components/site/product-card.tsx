"use client";

import Image from "next/image";
import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { formatUiText, localizeProduct, t } from "@/lib/i18n";
import { getProductPricing } from "@/lib/storefront";
import { formatMoney } from "@/lib/ui";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { currency, locale } = usePreferences();
  const localizedProduct = localizeProduct(product, locale);
  const mainImage = localizedProduct.images.toSorted((a, b) => a.sortOrder - b.sortOrder)[0];
  const pricing = getProductPricing(product);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={mainImage.path}
            alt={mainImage.alt}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-stone-900">
              {localizedProduct.name}
            </h3>
            {pricing.stockQty <= product.lowStockThreshold ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {t(locale, "lowStock")}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-6 text-stone-600">
            {localizedProduct.shortDescription}
          </p>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                {t(locale, "perPiece")}
              </p>
              <p className="text-lg font-semibold text-emerald-900">
                {formatMoney(pricing.piecePrice, currency)} / {t(locale, "pieceLabel")}
              </p>
              {pricing.hasPackPricing ? (
                <p className="text-sm text-stone-500">
                  {formatMoney(pricing.boxPrice, currency)} / {t(locale, "boxLabel")}{" "}
                  {formatUiText(locale, "piecesPerPackValue", {
                    count: String(pricing.packQuantity),
                  })}
                </p>
              ) : null}
            </div>
            <span className="text-sm font-medium text-stone-500">
              SKU {pricing.sku}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
