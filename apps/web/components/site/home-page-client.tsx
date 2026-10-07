"use client";

import Image from "next/image";
import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { ProductCard } from "@/components/site/product-card";
import {
  getPageBlock,
  localizeBanner,
  localizeGalleryItem,
  localizeProduct,
  localizeSiteStoreName,
  t,
} from "@/lib/i18n";
import type { SiteData } from "@/lib/types";

export function HomePageClient({ siteData }: { siteData: SiteData }) {
  const { locale } = usePreferences();
  const banners = siteData.banners
    .filter((banner) => banner.enabled)
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .map((banner) => localizeBanner(banner, locale));
  const featuredProducts = siteData.products
    .filter((product) => product.featured)
    .map((product) => localizeProduct(product, locale));
  const galleryItems = siteData.galleryItems
    .slice(0, 2)
    .map((item) => localizeGalleryItem(item, locale));

  const whyBlock = getPageBlock(siteData.managedPages, "/", "home-why-title");
  const featuredBlock = getPageBlock(siteData.managedPages, "/", "home-featured-title");
  const customBlock = getPageBlock(siteData.managedPages, "/", "home-custom-title");
  const customHighlightBlock = getPageBlock(siteData.managedPages, "/", "home-custom-highlight");
  const whyCards = [
    "home-why-card-1",
    "home-why-card-2",
    "home-why-card-3",
  ].map((blockId) => getPageBlock(siteData.managedPages, "/", blockId));

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`relative overflow-hidden rounded-[34px] ${
                index === 0 ? "min-h-[520px]" : "min-h-[250px]"
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-stone-950/65 via-stone-900/20 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-8 text-white lg:p-10">
                <p className="text-xs uppercase tracking-[0.35em] text-stone-200">
                  {localizeSiteStoreName(siteData.settings, locale)}
                </p>
                <h1 className="mt-3 max-w-xl text-5xl leading-none font-semibold lg:text-7xl">
                  {banner.title}
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-stone-200">
                  {banner.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={banner.href}
                    className="min-h-11 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900"
                  >
                    {t(locale, "exploreCollection")}
                  </Link>
                  <Link
                    href="/custom"
                    className="min-h-11 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white"
                  >
                    {t(locale, "requestCustom")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-[32px] bg-[#ece2d1] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            {whyBlock?.titleTranslations?.[locale] ?? whyBlock?.title ?? t(locale, "whyLansic")}
          </p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold text-stone-900">
            {whyBlock?.contentTranslations?.[locale] ?? whyBlock?.content}
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {whyCards.map((card, index) => (
            <div key={index} className="rounded-[28px] border border-stone-200 bg-white p-6">
              <p className="text-sm leading-7 text-stone-700">
                {card?.contentTranslations?.[locale] ?? card?.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              {featuredBlock?.titleTranslations?.[locale] ??
                featuredBlock?.title ??
                t(locale, "featuredCollection")}
            </p>
            <h2 className="mt-2 text-4xl font-semibold text-stone-900">
              {featuredBlock?.contentTranslations?.[locale] ?? featuredBlock?.content}
            </h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-emerald-900">
            {t(locale, "viewAllProducts")}
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[30px] border border-stone-200 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            {customBlock?.titleTranslations?.[locale] ??
              customBlock?.title ??
              t(locale, "customProgram")}
          </p>
          <h2 className="mt-2 text-4xl font-semibold text-stone-900">
            {customHighlightBlock?.contentTranslations?.[locale] ?? customHighlightBlock?.content}
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-600">
            {customBlock?.contentTranslations?.[locale] ?? customBlock?.content}
          </p>
          <Link
            href="/custom"
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
          >
            {t(locale, "startCustomInquiry")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-stone-200 bg-white"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                  {item.category}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
