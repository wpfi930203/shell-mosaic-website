import { CustomPageClient } from "@/components/site/custom-page-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function CustomPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <CustomPageClient siteData={siteData} />
    </SiteShell>
  );
}
