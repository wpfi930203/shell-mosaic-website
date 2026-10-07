"use client";

import { useState, type ReactNode } from "react";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useSiteData } from "@/components/admin/use-site-data";
import { localeLabels } from "@/lib/i18n";
import type {
  FilterGroup,
  LocaleCode,
  LocalizedText,
  Product,
  ProductImage,
  ProductVariant,
} from "@/lib/types";

export default function AdminProductsPage() {
  const { data, save, status } = useSiteData();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("zh");

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  // `data` is non-null from here on. Capture it in a const so the nested
  // handlers below keep the narrowed type (TypeScript widens captured
  // variables back to their declared type inside function declarations).
  const siteData = data;

  function updateProduct(index: number, updater: (product: Product) => Product) {
    const nextProducts = [...siteData.products];
    nextProducts[index] = updater(nextProducts[index]);
    save({ ...siteData, products: nextProducts });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Products</p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-900">
              Product catalog manager
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-stone-500">
              Every number now has a clear meaning. Product categories are selected from the
              existing catalog instead of being typed manually. Variants can be created for finish,
              size or any sellable option.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 text-sm font-medium text-stone-700">
              Editing language
              <select
                value={activeLocale}
                onChange={(event) => setActiveLocale(event.target.value as LocaleCode)}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              >
                {data.settings.enabledLocales.map((locale) => (
                  <option key={locale} value={locale}>
                    {localeLabels[locale]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => save({ ...data, products: [...data.products, createEmptyProduct()] })}
              className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Add Product
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm text-stone-500">{status}</p>
      </div>

      <div className="space-y-5">
        {data.products.map((product, index) => (
          <div key={product.id} className="rounded-[24px] border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  {product.name || "Untitled Product"}
                </p>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {product.sku || "SKU pending"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  save({
                    ...data,
                    products: data.products.filter((candidate) => candidate.id !== product.id),
                  })
                }
                className="min-h-11 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
              >
                Delete Product
              </button>
            </div>

            <SectionCard
              title="Basic Info"
              description="Main identity fields used by the admin, storefront cards and product detail page."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Product Name (English)" hint="Base product title.">
                  <input
                    value={product.name}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({ ...current, name: event.target.value }))
                    }
                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  />
                </Field>
                <Field
                  label={`Product Name (${activeLocale.toUpperCase()})`}
                  hint="Optional translated name for the selected admin language."
                >
                  <input
                    value={product.nameTranslations?.[activeLocale] ?? ""}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({
                        ...current,
                        nameTranslations: updateTranslation(
                          current.nameTranslations,
                          activeLocale,
                          event.target.value,
                        ),
                      }))
                    }
                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  />
                </Field>
                <Field label="Slug" hint="Used in the product detail page URL.">
                  <input
                    value={product.slug}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({ ...current, slug: event.target.value }))
                    }
                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  />
                </Field>
                <Field label="Base SKU" hint="Fallback SKU when no variant-specific SKU is used.">
                  <input
                    value={product.sku}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({ ...current, sku: event.target.value }))
                    }
                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  />
                </Field>
                <Field
                  label="Featured Product"
                  hint="Featured products can be shown in homepage highlights."
                >
                  <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={product.featured}
                      onChange={(event) =>
                        updateProduct(index, (current) => ({
                          ...current,
                          featured: event.target.checked,
                        }))
                      }
                    />
                    Featured product
                  </label>
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Default Pricing & Inventory"
              description="These values are used when the product has no variants, or when a variant does not override them."
            >
              <NumberMeaningList
                items={[
                  "Single Piece Price: sell price for one piece or sheet.",
                  "Pack / Box Price: sell price for one full box.",
                  "Pieces per Pack: how many pieces are inside one box.",
                  "Stock Quantity: current inventory, counted in pieces.",
                  "Low Stock Alert: warning threshold, also counted in pieces.",
                ]}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <NumberField
                  label="Single Piece Price (per piece)"
                  hint="Selling price for one piece or one sheet."
                  value={product.piecePrice}
                  onChange={(value) =>
                    updateProduct(index, (current) => ({ ...current, piecePrice: value }))
                  }
                  min={0}
                  step={0.01}
                />
                <NumberField
                  label="Pack / Box Price (per box)"
                  hint="Selling price for one full pack or one box."
                  value={product.boxPrice}
                  onChange={(value) =>
                    updateProduct(index, (current) => ({ ...current, boxPrice: value }))
                  }
                  min={0}
                  step={0.01}
                />
                <NumberField
                  label="Pieces per Pack (pieces)"
                  hint="How many pieces are inside one pack or box."
                  value={product.packQuantity}
                  onChange={(value) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      packQuantity: parsePositiveInteger(value),
                    }))
                  }
                  min={0}
                  step={1}
                />
                <NumberField
                  label="Stock Quantity (pieces)"
                  hint="Available inventory, counted in pieces."
                  value={product.stockQty}
                  onChange={(value) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      stockQty: parseNonNegativeNumber(value),
                    }))
                  }
                  min={0}
                  step={1}
                />
                <NumberField
                  label="Low Stock Alert (pieces)"
                  hint="Alert threshold when stock falls to this piece count."
                  value={product.lowStockThreshold}
                  onChange={(value) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      lowStockThreshold: parseNonNegativeNumber(value),
                    }))
                  }
                  min={0}
                  step={1}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Categories"
              description="Choose values from the existing catalog. Manual free typing is no longer used."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <CategorySelector
                  title="Materials"
                  description="Example: Marble, Glass, Metal."
                  group={findGroup(data.filterGroups, "materials")}
                  selected={product.materials}
                  onToggle={(label) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      materials: toggleSelection(current.materials, label),
                    }))
                  }
                />
                <CategorySelector
                  title="Patterns"
                  description="Example: Hexagon, Fan Shape, Waterjet Cut."
                  group={findGroup(data.filterGroups, "patterns")}
                  selected={product.patterns}
                  onToggle={(label) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      patterns: toggleSelection(current.patterns, label),
                    }))
                  }
                />
                <CategorySelector
                  title="Colors"
                  description="Example: White & Beige, Blue & Green."
                  group={findGroup(data.filterGroups, "colors")}
                  selected={product.colors}
                  onToggle={(label) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      colors: toggleSelection(current.colors, label),
                    }))
                  }
                />
                <CategorySelector
                  title="Application"
                  description="Example: Indoor, Outdoor."
                  group={findGroup(data.filterGroups, "applications")}
                  selected={product.applications}
                  onToggle={(label) =>
                    updateProduct(index, (current) => ({
                      ...current,
                      applications: toggleSelection(current.applications, label),
                    }))
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Variants"
              description="Create sellable options such as finish, size or edition. Each variant can have its own SKU, price, pack quantity and stock."
            >
              <NumberMeaningList
                items={[
                  "Each variant is a real sellable option, such as Honed, Polished or 12x12 Sheet.",
                  "Variant Piece Price and Variant Box Price override the product default numbers.",
                  "Variant Pieces per Pack and Variant Stock are also counted in pieces.",
                  "Variant images let the storefront show a different gallery for each option.",
                ]}
              />
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-stone-500">
                  If no variant exists, storefront pricing uses the default pricing above.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateProduct(index, (current) => ({
                      ...current,
                      variants: [...(current.variants ?? []), createEmptyVariant()],
                    }))
                  }
                  className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Add Variant
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {(product.variants ?? []).length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-500">
                    No variants yet. Add one if this product needs finish, size or other product
                    options.
                  </div>
                ) : null}

                {(product.variants ?? []).map((variant, variantIndex) => (
                  <div key={variant.id} className="rounded-[20px] border border-stone-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-stone-900">
                          {variant.name || `Variant ${variantIndex + 1}`}
                        </p>
                        <p className="text-sm text-stone-500">
                          Distinct sellable option with its own numbers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateProduct(index, (current) => ({
                            ...current,
                            variants: (current.variants ?? []).filter(
                              (candidate) => candidate.id !== variant.id,
                            ),
                          }))
                        }
                        className="min-h-11 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Remove Variant
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Field label="Variant Name" hint="Example: Honed Finish, Gloss, 12x12 Sheet.">
                        <input
                          value={variant.name}
                          onChange={(event) =>
                            updateProduct(index, (current) => ({
                              ...current,
                              variants: updateProductVariant(current.variants, variantIndex, {
                                ...variant,
                                name: event.target.value,
                              }),
                            }))
                          }
                          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                        />
                      </Field>
                      <Field label="Variant SKU" hint="SKU used when this variant is sold.">
                        <input
                          value={variant.sku}
                          onChange={(event) =>
                            updateProduct(index, (current) => ({
                              ...current,
                              variants: updateProductVariant(current.variants, variantIndex, {
                                ...variant,
                                sku: event.target.value,
                              }),
                            }))
                          }
                          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                        />
                      </Field>
                      <NumberField
                        label="Variant Piece Price (per piece)"
                        hint="Override price for one piece or sheet."
                        value={variant.piecePrice}
                        onChange={(value) =>
                          updateProduct(index, (current) => ({
                            ...current,
                            variants: updateProductVariant(current.variants, variantIndex, {
                              ...variant,
                              piecePrice: value,
                            }),
                          }))
                        }
                        min={0}
                        step={0.01}
                      />
                      <NumberField
                        label="Variant Box Price (per box)"
                        hint="Override price for one full pack or box."
                        value={variant.boxPrice}
                        onChange={(value) =>
                          updateProduct(index, (current) => ({
                            ...current,
                            variants: updateProductVariant(current.variants, variantIndex, {
                              ...variant,
                              boxPrice: value,
                            }),
                          }))
                        }
                        min={0}
                        step={0.01}
                      />
                      <NumberField
                        label="Variant Pieces per Pack (pieces)"
                        hint="How many pieces are included in this variant pack."
                        value={variant.packQuantity}
                        onChange={(value) =>
                          updateProduct(index, (current) => ({
                            ...current,
                            variants: updateProductVariant(current.variants, variantIndex, {
                              ...variant,
                              packQuantity: parsePositiveInteger(value),
                            }),
                          }))
                        }
                        min={0}
                        step={1}
                      />
                      <NumberField
                        label="Variant Stock (pieces)"
                        hint="Available inventory for this variant, counted in pieces."
                        value={variant.stockQty}
                        onChange={(value) =>
                          updateProduct(index, (current) => ({
                            ...current,
                            variants: updateProductVariant(current.variants, variantIndex, {
                              ...variant,
                              stockQty: parseNonNegativeNumber(value),
                            }),
                          }))
                        }
                        min={0}
                        step={1}
                      />
                      <Field label="Enabled" hint="Disabled variants are hidden on storefront.">
                        <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.enabled}
                            onChange={(event) =>
                              updateProduct(index, (current) => ({
                                ...current,
                                variants: updateProductVariant(current.variants, variantIndex, {
                                  ...variant,
                                  enabled: event.target.checked,
                                }),
                              }))
                            }
                          />
                          Enabled on storefront
                        </label>
                      </Field>
                      <Field
                        label="Default Variant"
                        hint="The default variant is preselected on the product page."
                      >
                        <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={variant.isDefault ?? false}
                            onChange={(event) =>
                              updateProduct(index, (current) => ({
                                ...current,
                                variants: setDefaultVariant(
                                  current.variants ?? [],
                                  variant.id,
                                  event.target.checked,
                                ),
                              }))
                            }
                          />
                          Set as default
                        </label>
                      </Field>
                    </div>

                    <div className="mt-5 rounded-[20px] border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">Variant Images</p>
                          <p className="mt-1 text-sm text-stone-500">
                            Upload images used only when this variant is selected.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateProduct(index, (current) => ({
                              ...current,
                              variants: updateProductVariant(current.variants, variantIndex, {
                                ...variant,
                                images: [
                                  ...(variant.images ?? []),
                                  createEmptyProductImage((variant.images ?? []).length + 1),
                                ],
                              }),
                            }))
                          }
                          className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
                        >
                          Add Variant Image
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {(variant.images ?? []).length === 0 ? (
                          <div className="rounded-[20px] border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-500">
                            This variant does not have its own gallery yet. If left empty, the
                            storefront falls back to the main product images.
                          </div>
                        ) : null}

                        {(variant.images ?? []).map((image, imageIndex) => (
                          <div key={image.id} className="rounded-[20px] border border-stone-200 bg-white p-4">
                            <div className="grid gap-4">
                              <ImageUploadField
                                label={image.type === "main" ? "Variant main image" : "Variant detail image"}
                                value={image.path}
                                helperText="Shown in the gallery after this variant is chosen."
                                onChange={(value) =>
                                  updateProduct(index, (current) => ({
                                    ...current,
                                    variants: updateProductVariant(current.variants, variantIndex, {
                                      ...variant,
                                      images: updateVariantImage(variant.images, imageIndex, {
                                        ...image,
                                        path: value,
                                      }),
                                    }),
                                  }))
                                }
                              />
                              <Field label="Image Alt Text" hint="Used for accessibility and SEO.">
                                <input
                                  value={image.alt}
                                  onChange={(event) =>
                                    updateProduct(index, (current) => ({
                                      ...current,
                                      variants: updateProductVariant(current.variants, variantIndex, {
                                        ...variant,
                                        images: updateVariantImage(variant.images, imageIndex, {
                                          ...image,
                                          alt: event.target.value,
                                        }),
                                      }),
                                    }))
                                  }
                                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                                />
                              </Field>
                              <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Image Role" hint="Main or detail image.">
                                  <select
                                    value={image.type}
                                    onChange={(event) =>
                                      updateProduct(index, (current) => ({
                                        ...current,
                                        variants: updateProductVariant(current.variants, variantIndex, {
                                          ...variant,
                                          images: updateVariantImage(variant.images, imageIndex, {
                                            ...image,
                                            type: event.target.value as ProductImage["type"],
                                          }),
                                        }),
                                      }))
                                    }
                                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                                  >
                                    <option value="main">Main</option>
                                    <option value="detail">Detail</option>
                                  </select>
                                </Field>
                                <NumberField
                                  label="Sort Order"
                                  hint="Lower numbers appear earlier."
                                  value={image.sortOrder}
                                  onChange={(value) =>
                                    updateProduct(index, (current) => ({
                                      ...current,
                                      variants: updateProductVariant(current.variants, variantIndex, {
                                        ...variant,
                                        images: updateVariantImage(variant.images, imageIndex, {
                                          ...image,
                                          sortOrder: parseNonNegativeNumber(value),
                                        }),
                                      }),
                                    }))
                                  }
                                  min={1}
                                  step={1}
                                />
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-stone-800">Delete Image</p>
                                  <p className="text-xs text-stone-500">
                                    Remove this image from the variant gallery.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProduct(index, (current) => ({
                                        ...current,
                                        variants: updateProductVariant(current.variants, variantIndex, {
                                          ...variant,
                                          images: (variant.images ?? []).filter(
                                            (candidate) => candidate.id !== image.id,
                                          ),
                                        }),
                                      }))
                                    }
                                    className="min-h-11 w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Description"
              description="English is the base content. Optional translated text can be entered for the selected admin language."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Short Description (English)" hint="Used in cards and top intro copy.">
                  <textarea
                    value={product.shortDescription}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({
                        ...current,
                        shortDescription: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    rows={3}
                  />
                </Field>
                <Field
                  label={`Short Description (${activeLocale.toUpperCase()})`}
                  hint="Optional translated short description."
                >
                  <textarea
                    value={product.shortDescriptionTranslations?.[activeLocale] ?? ""}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({
                        ...current,
                        shortDescriptionTranslations: updateTranslation(
                          current.shortDescriptionTranslations,
                          activeLocale,
                          event.target.value,
                        ),
                      }))
                    }
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    rows={3}
                  />
                </Field>
                <Field label="A+ HTML Description (English)" hint="Rich content for the detail page.">
                  <textarea
                    value={product.descriptionHtml}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({
                        ...current,
                        descriptionHtml: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    rows={8}
                  />
                </Field>
                <Field
                  label={`A+ HTML Description (${activeLocale.toUpperCase()})`}
                  hint="Optional translated rich description."
                >
                  <textarea
                    value={product.descriptionHtmlTranslations?.[activeLocale] ?? ""}
                    onChange={(event) =>
                      updateProduct(index, (current) => ({
                        ...current,
                        descriptionHtmlTranslations: updateTranslation(
                          current.descriptionHtmlTranslations,
                          activeLocale,
                          event.target.value,
                        ),
                      }))
                    }
                    className="rounded-2xl border border-stone-200 px-4 py-3"
                    rows={8}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Product Images"
              description="Upload the main image and additional detail images. Sort order controls display priority."
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-stone-500">
                  Main image is usually used on cards. Detail images appear inside the product gallery.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateProduct(index, (current) => ({
                      ...current,
                      images: [...current.images, createEmptyProductImage(current.images.length + 1)],
                    }))
                  }
                  className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Add Product Image
                </button>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {product.images
                  .toSorted((a, b) => a.sortOrder - b.sortOrder)
                  .map((image) => {
                    const imageIndex = product.images.findIndex((candidate) => candidate.id === image.id);
                    return (
                      <div key={image.id} className="rounded-[20px] border border-stone-200 bg-white p-4">
                        <div className="grid gap-4">
                          <ImageUploadField
                            label={image.type === "main" ? "Main image" : "Detail image"}
                            value={image.path}
                            helperText="Used on product cards and the product detail page gallery."
                            onChange={(value) =>
                              updateProduct(index, (current) => ({
                                ...current,
                                images: updateProductImage(current.images, imageIndex, {
                                  ...image,
                                  path: value,
                                }),
                              }))
                            }
                          />
                          <Field label="Image Alt Text" hint="Used for accessibility and SEO.">
                            <input
                              value={image.alt}
                              onChange={(event) =>
                                updateProduct(index, (current) => ({
                                  ...current,
                                  images: updateProductImage(current.images, imageIndex, {
                                    ...image,
                                    alt: event.target.value,
                                  }),
                                }))
                              }
                              className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                            />
                          </Field>
                          <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Image Role" hint="Main or detail image.">
                              <select
                                value={image.type}
                                onChange={(event) =>
                                  updateProduct(index, (current) => ({
                                    ...current,
                                    images: updateProductImage(current.images, imageIndex, {
                                      ...image,
                                      type: event.target.value as ProductImage["type"],
                                    }),
                                  }))
                                }
                                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                              >
                                <option value="main">Main</option>
                                <option value="detail">Detail</option>
                              </select>
                            </Field>
                            <NumberField
                              label="Sort Order"
                              hint="Lower numbers appear earlier."
                              value={image.sortOrder}
                              onChange={(value) =>
                                updateProduct(index, (current) => ({
                                  ...current,
                                  images: updateProductImage(current.images, imageIndex, {
                                    ...image,
                                    sortOrder: parseNonNegativeNumber(value),
                                  }),
                                }))
                              }
                              min={1}
                              step={1}
                            />
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-stone-800">Delete Image</p>
                              <p className="text-xs text-stone-500">
                                Remove this image from the product gallery.
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  updateProduct(index, (current) => ({
                                    ...current,
                                    images: current.images.filter(
                                      (candidate) => candidate.id !== image.id,
                                    ),
                                  }))
                                }
                                className="min-h-11 w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </SectionCard>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-5">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm text-stone-500">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-800">{label}</p>
      <p className="text-xs text-stone-500">{hint}</p>
      {children}
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  step: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
      />
    </Field>
  );
}

function NumberMeaningList({ items }: { items: string[] }) {
  return (
    <div className="mb-4 rounded-[20px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
      <p className="font-semibold">What each number means</p>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function CategorySelector({
  title,
  description,
  group,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  group: FilterGroup | undefined;
  selected: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-4">
      <p className="text-base font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(group?.options ?? [])
          .filter((option) => option.enabled)
          .toSorted((a, b) => a.sortOrder - b.sortOrder)
          .map((option) => {
            const active = selected.includes(option.label);
            return (
              <label
                key={option.id}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                  active
                    ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                    : "border-stone-300 text-stone-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggle(option.label)}
                />
                {option.label}
              </label>
            );
          })}
      </div>
    </div>
  );
}

function findGroup(groups: FilterGroup[], key: FilterGroup["key"]) {
  return groups.find((group) => group.key === key);
}

function toggleSelection(current: string[], value: string) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

function updateTranslation(
  current: LocalizedText | undefined,
  locale: LocaleCode,
  value: string,
) {
  return {
    ...(current ?? {}),
    [locale]: value,
  };
}

function updateProductImage(images: ProductImage[], index: number, nextImage: ProductImage) {
  const nextImages = [...images];
  nextImages[index] = nextImage;
  return nextImages;
}

function updateProductVariant(
  variants: ProductVariant[] | undefined,
  index: number,
  nextVariant: ProductVariant,
) {
  const nextVariants = [...(variants ?? [])];
  nextVariants[index] = nextVariant;
  return nextVariants;
}

function updateVariantImage(
  images: ProductImage[] | undefined,
  index: number,
  nextImage: ProductImage,
) {
  const nextImages = [...(images ?? [])];
  nextImages[index] = nextImage;
  return nextImages;
}

function setDefaultVariant(variants: ProductVariant[], variantId: string, checked: boolean) {
  if (!checked) {
    return variants.map((variant) =>
      variant.id === variantId ? { ...variant, isDefault: false } : variant,
    );
  }

  return variants.map((variant) => ({
    ...variant,
    isDefault: variant.id === variantId,
  }));
}

function createEmptyProductImage(sortOrder: number): ProductImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    path: "",
    alt: "",
    type: sortOrder === 1 ? "main" : "detail",
    sortOrder,
  };
}

function createEmptyVariant(): ProductVariant {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: "New Variant",
    sku: "",
    piecePrice: 0,
    boxPrice: 0,
    packQuantity: 0,
    stockQty: 0,
    images: [],
    enabled: true,
    isDefault: false,
  };
}

function createEmptyProduct(): Product {
  return {
    id: `product-${Date.now()}`,
    slug: `new-product-${Date.now()}`,
    name: "New Product",
    shortDescription: "",
    descriptionHtml: "<p>Describe the product value, applications and design details here.</p>",
    piecePrice: 0,
    boxPrice: 0,
    packQuantity: 0,
    stockQty: 0,
    lowStockThreshold: 10,
    sku: `SKU-${Date.now()}`,
    materials: [],
    patterns: [],
    colors: [],
    applications: [],
    featured: false,
    images: [createEmptyProductImage(1)],
    variants: [],
  };
}

function parsePositiveInteger(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.floor(value);
}

function parseNonNegativeNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}
