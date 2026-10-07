import { notFound } from "next/navigation";

import { ProductDetailClient } from "@/components/site/product-detail-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteData = await readSiteData();
  const product = siteData.products.find((candidate) => candidate.slug === slug);

  if (!product) {
    notFound();
  }

  const reviews = siteData.reviews.filter((review) => review.productId === product.id);

  return (
    <SiteShell siteData={siteData}>
      <ProductDetailClient product={product} reviews={reviews} settings={siteData.settings} />
    </SiteShell>
  );
}
