"use client";

import { useMemo, useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ProductCard } from "@/components/site/product-card";
import { filterProducts } from "@/lib/storefront";
import { localizeFilterGroup, t } from "@/lib/i18n";
import type { FilterGroup, Product } from "@/lib/types";

export function ShopClient({
  products,
  filterGroups,
}: {
  products: Product[];
  filterGroups: FilterGroup[];
}) {
  const { locale } = usePreferences();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<"latest" | "price_asc" | "price_desc">("latest");

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        materials: selected.materials,
        patterns: selected.patterns,
        colors: selected.colors,
        applications: selected.applications,
        sort,
      }),
    [products, selected, sort],
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[300px_1fr] lg:px-8">
      <aside className="rounded-[28px] border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-stone-900">{t(locale, "shopTitle")}</h1>
          <button
            type="button"
            onClick={() => setSelected({})}
            className="text-sm font-semibold text-emerald-900"
          >
            {t(locale, "reset")}
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {filterGroups
            .filter((group) => group.enabled)
            .map((group) => {
              const localizedGroup = localizeFilterGroup(group, locale);
              return (
              <div key={group.key}>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {localizedGroup.label}
                </p>
                <div className="mt-3 space-y-2">
                  {localizedGroup.options
                    .filter((option) => option.enabled)
                    .toSorted((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => {
                      const active = (selected[group.key] ?? []).includes(option.label);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`flex min-h-11 w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm ${
                            active
                              ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                              : "border-stone-200 text-stone-700"
                          }`}
                          onClick={() =>
                            setSelected((current) => {
                              const nextValues = current[group.key] ?? [];
                              const hasValue = nextValues.includes(option.label);
                              return {
                                ...current,
                                [group.key]: hasValue
                                  ? nextValues.filter((value) => value !== option.label)
                                  : [...nextValues, option.label],
                              };
                            })
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            )})}
        </div>
      </aside>

      <section>
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              {t(locale, "curatedCollection")}
            </p>
            <h2 className="mt-2 text-4xl font-semibold text-stone-900">
              {t(locale, "filterHint")}
            </h2>
          </div>
          <label className="text-sm font-medium text-stone-600">
            {t(locale, "sortBy")}
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "latest" | "price_asc" | "price_desc")
              }
              className="ml-3 rounded-full border border-stone-200 px-3 py-2"
            >
              <option value="latest">{t(locale, "latest")}</option>
              <option value="price_asc">{t(locale, "priceAsc")}</option>
              <option value="price_desc">{t(locale, "priceDesc")}</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
