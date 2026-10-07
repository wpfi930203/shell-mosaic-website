import type { ReactNode } from "react";

import { CartProvider } from "@/components/providers/cart-provider";
import { CartDrawer } from "@/components/site/cart-drawer";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import type { SiteData } from "@/lib/types";

export function SiteShell({
  children,
  siteData,
}: {
  children: ReactNode;
  siteData: SiteData;
}) {
  return (
    <PreferencesProvider
      defaultLocale={siteData.settings.defaultLocale}
      defaultCurrency={siteData.settings.defaultCurrency}
    >
      <CartProvider>
        <div className="min-h-screen bg-[#f6f0e8] text-stone-900">
          <SiteHeader settings={siteData.settings} menu={siteData.mainMenu} />
          <main>{children}</main>
          <SiteFooter
            footerSections={siteData.footerSections}
            socialLinks={siteData.socialLinks}
          />
          <CartDrawer
            products={siteData.products}
            shippingMethods={siteData.shippingMethods}
            discountCodes={siteData.discountCodes}
            settings={siteData.settings}
          />
        </div>
      </CartProvider>
    </PreferencesProvider>
  );
}
