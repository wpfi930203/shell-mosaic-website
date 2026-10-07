import { HomePageClient } from "@/components/site/home-page-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <HomePageClient siteData={siteData} />
    </SiteShell>
  );
}
