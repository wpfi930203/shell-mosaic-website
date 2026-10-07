import { SiteShell } from "@/components/site/site-shell";
import { ShopClient } from "@/components/site/shop-client";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <ShopClient
        products={siteData.products}
        filterGroups={siteData.filterGroups}
      />
    </SiteShell>
  );
}
