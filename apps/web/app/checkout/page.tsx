import { CheckoutClient } from "@/components/site/checkout-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <CheckoutClient
        products={siteData.products}
        shippingMethods={siteData.shippingMethods}
        discountCodes={siteData.discountCodes}
        settings={siteData.settings}
      />
    </SiteShell>
  );
}
