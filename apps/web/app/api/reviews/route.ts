import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";
import { canSubmitReview } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    productId: string;
    orderId: string;
    email: string;
    customerName: string;
    rating: number;
    content: string;
    images?: string[];
  };

  const siteData = await readSiteData();
  const allowed = canSubmitReview(siteData, {
    productId: body.productId,
    orderId: body.orderId,
    email: body.email,
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Only verified customers can submit one review per product." },
      { status: 400 },
    );
  }

  const review = {
    id: `review-${siteData.reviews.length + 1}`,
    productId: body.productId,
    orderId: body.orderId,
    customerEmail: body.email,
    customerName: body.customerName,
    rating: body.rating,
    content: body.content,
    status: "pending" as const,
    verifiedPurchase: true,
    images: body.images ?? [],
    createdAt: new Date().toISOString(),
  };

  const nextData = {
    ...siteData,
    reviews: [review, ...siteData.reviews],
  };

  await writeSiteData(nextData);

  return NextResponse.json(review, { status: 201 });
}
