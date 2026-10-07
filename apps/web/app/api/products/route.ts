import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";
import type { Product, ProductImage, ProductVariant } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteData = await readSiteData();
  return NextResponse.json(siteData.products.map(toProductApiResponse));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Product> & {
    priceSingle?: number;
    pricePack?: number;
    packQuantity?: number;
  };

  const siteData = await readSiteData();
  const product = normalizeProduct(body);
  const nextData = {
    ...siteData,
    products: [product, ...siteData.products],
  };

  const savedData = await writeSiteData(nextData);
  const savedProduct = savedData.products.find((candidate) => candidate.id === product.id) ?? product;
  return NextResponse.json(toProductApiResponse(savedProduct), { status: 201 });
}

function toProductApiResponse(product: Product) {
  return {
    ...product,
    priceSingle: product.piecePrice,
    pricePack: product.boxPrice,
  };
}

function normalizeProduct(
  body: Partial<Product> & { priceSingle?: number; pricePack?: number; packQuantity?: number },
): Product {
  const now = Date.now();
  return {
    id: body.id ?? `product-${now}`,
    slug: body.slug ?? `product-${now}`,
    name: body.name ?? "New Product",
    nameTranslations: body.nameTranslations,
    shortDescription: body.shortDescription ?? "",
    shortDescriptionTranslations: body.shortDescriptionTranslations,
    descriptionHtml: body.descriptionHtml ?? "",
    descriptionHtmlTranslations: body.descriptionHtmlTranslations,
    piecePrice: body.priceSingle ?? body.piecePrice ?? 0,
    boxPrice: body.pricePack ?? body.boxPrice ?? 0,
    packQuantity: normalizePackQuantity(body.packQuantity),
    stockQty: body.stockQty ?? 0,
    lowStockThreshold: body.lowStockThreshold ?? 10,
    sku: body.sku ?? `SKU-${now}`,
    materials: body.materials ?? [],
    patterns: body.patterns ?? [],
    colors: body.colors ?? [],
    applications: body.applications ?? [],
    featured: body.featured ?? false,
    images: normalizeImages(body.images),
    variants: normalizeVariants(body.variants),
  };
}

function normalizePackQuantity(value: number | undefined) {
  if (!Number.isFinite(value) || (value ?? 0) <= 0) {
    return 0;
  }

  return Math.floor(value as number);
}

function normalizeVariants(variants: ProductVariant[] | undefined): ProductVariant[] {
  return (variants ?? []).map((variant) => ({
    ...variant,
    piecePrice: Number.isFinite(variant.piecePrice) ? variant.piecePrice : 0,
    boxPrice: Number.isFinite(variant.boxPrice) ? variant.boxPrice : 0,
    packQuantity: normalizePackQuantity(variant.packQuantity),
    stockQty: Number.isFinite(variant.stockQty) && variant.stockQty >= 0 ? variant.stockQty : 0,
    images: normalizeImages(variant.images),
    enabled: variant.enabled ?? true,
    isDefault: variant.isDefault ?? false,
  }));
}

function normalizeImages(images: ProductImage[] | undefined): ProductImage[] {
  return (images ?? []).map((image, index) => ({
    ...image,
    alt: typeof image.alt === "string" ? image.alt : "",
    type: image.type === "detail" ? "detail" : "main",
    sortOrder:
      Number.isFinite(image.sortOrder) && image.sortOrder > 0 ? Math.floor(image.sortOrder) : index + 1,
  }));
}
