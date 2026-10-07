import { OrderTrackingClient } from "@/components/site/order-tracking-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <OrderTrackingClient orders={siteData.orders} />
    </SiteShell>
  );
}
