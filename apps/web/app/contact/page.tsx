import { ContactPageClient } from "@/components/site/contact-page-client";
import { SiteShell } from "@/components/site/site-shell";
import { readSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const siteData = await readSiteData();

  return (
    <SiteShell siteData={siteData}>
      <ContactPageClient siteData={siteData} />
    </SiteShell>
  );
}
