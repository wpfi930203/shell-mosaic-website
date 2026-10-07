import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";
import type { Product, ProductImage, ProductVariant } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const siteData = await readSiteData();
  const product = siteData.products.find((candidate) => candidate.id === id);

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(toProductApiResponse(product));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<Product> & {
    priceSingle?: number;
    pricePack?: number;
    packQuantity?: number;
  };

  const siteData = await readSiteData();
  const index = siteData.products.findIndex((candidate) => candidate.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const current = siteData.products[index];
  const nextProduct: Product = {
    ...current,
    ...body,
    piecePrice: body.priceSingle ?? body.piecePrice ?? current.piecePrice,
    boxPrice: body.pricePack ?? body.boxPrice ?? current.boxPrice,
    packQuantity: normalizePackQuantity(body.packQuantity ?? current.packQuantity),
    variants: normalizeVariants(body.variants ?? current.variants),
  };

  const nextProducts = [...siteData.products];
  nextProducts[index] = nextProduct;

  const savedData = await writeSiteData({
    ...siteData,
    products: nextProducts,
  });

  const savedProduct = savedData.products.find((candidate) => candidate.id === id) ?? nextProduct;
  return NextResponse.json(toProductApiResponse(savedProduct));
}

function toProductApiResponse(product: Product) {
  return {
    ...product,
    priceSingle: product.piecePrice,
    pricePack: product.boxPrice,
  };
}

function normalizePackQuantity(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.floor(value);
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
