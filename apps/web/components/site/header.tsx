"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/providers/cart-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localeLabels, localizeMenuItem, localizeSiteStoreName, t } from "@/lib/i18n";
import { currencySymbols } from "@/lib/ui";
import type { MenuItem, SiteSettings } from "@/lib/types";

export function SiteHeader({
  settings,
  menu,
}: {
  settings: SiteSettings;
  menu: MenuItem[];
}) {
  const { currency, locale, setCurrency, setLocale } = usePreferences();
  const { itemCount, openDrawer } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full border border-stone-200 p-2 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={t(locale, "toggleMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex flex-col">
            {settings.logoType === "image" && settings.logoPath ? (
              <Image
                src={settings.logoPath}
                alt={settings.brandName}
                width={settings.logoWidth}
                height={settings.logoHeight}
                className="object-contain"
                style={{
                  width: settings.logoWidth,
                  height: settings.logoHeight,
                }}
              />
            ) : (
              <span
                className="leading-none"
                style={{
                  fontFamily: settings.storeNameFontFamily,
                  fontSize: settings.storeNameFontSize,
                  color: settings.storeNameColor,
                }}
              >
                {settings.logoText || settings.brandName}
              </span>
            )}
            <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
              {localizeSiteStoreName(settings, locale)}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {menu
            .filter((item) => item.enabled)
            .map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="transition-colors hover:text-emerald-800"
                style={{
                  fontSize: item.fontSize,
                  fontWeight: item.fontWeight,
                  color: item.color,
                }}
              >
                {localizeMenuItem(item, locale)}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <select
            aria-label={t(locale, "switchLanguage")}
            value={locale}
            onChange={(event) => setLocale(event.target.value as typeof locale)}
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm"
          >
            {settings.enabledLocales.map((candidate) => (
              <option key={candidate} value={candidate}>
                {localeLabels[candidate]}
              </option>
            ))}
          </select>
          <select
            aria-label={t(locale, "switchCurrency")}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as typeof currency)}
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm"
          >
            {settings.enabledCurrencies.map((candidate) => (
              <option key={candidate} value={candidate}>
                {currencySymbols[candidate]} {candidate}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openDrawer}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-900 hover:text-emerald-900"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {itemCount}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-stone-200 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {menu
              .filter((item) => item.enabled)
              .map((item) => (
                <Link key={item.id} href={item.href} className="text-sm font-semibold">
                  {localizeMenuItem(item, locale)}
                </Link>
              ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
