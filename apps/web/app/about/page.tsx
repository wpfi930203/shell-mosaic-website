import { AboutPageClient } from "@/components/site/about-page-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <AboutPageClient siteData={siteData} />
    </SiteShell>
  );
}
