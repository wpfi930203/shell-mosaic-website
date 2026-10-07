import { CartClient } from "@/components/site/cart-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <CartClient
        products={siteData.products}
        shippingMethods={siteData.shippingMethods}
        discountCodes={siteData.discountCodes}
        settings={siteData.settings}
      />
    </SiteShell>
  );
}
