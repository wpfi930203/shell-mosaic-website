import { GalleryPageClient } from "@/components/site/gallery-page-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <GalleryPageClient siteData={siteData} />
    </SiteShell>
  );
}
