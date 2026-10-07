"use client";

import Image from "next/image";

import { usePreferences } from "@/components/providers/preferences-provider";
import { InquiryForm } from "@/components/site/inquiry-form";
import { getPageBlock, localizeGalleryItem, t } from "@/lib/i18n";
import type { SiteData } from "@/lib/types";

export function CustomPageClient({ siteData }: { siteData: SiteData }) {
  const { locale } = usePreferences();
  const heroBlock = getPageBlock(siteData.managedPages, "/custom", "custom-hero-title");
  const bodyBlock = getPageBlock(siteData.managedPages, "/custom", "custom-hero-body");
  const featureBlocks = [
    "custom-feature-1",
    "custom-feature-2",
    "custom-feature-3",
  ].map((blockId) => getPageBlock(siteData.managedPages, "/custom", blockId));
  const galleryItems = siteData.galleryItems.map((item) => localizeGalleryItem(item, locale));

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="space-y-6">
        <div className="rounded-[30px] border border-stone-200 bg-white p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            {heroBlock?.titleTranslations?.[locale] ?? heroBlock?.title ?? t(locale, "customProgram")}
          </p>
          <h1 className="mt-2 text-5xl font-semibold text-stone-900">
            {heroBlock?.contentTranslations?.[locale] ?? heroBlock?.content}
          </h1>
          {heroBlock?.imagePath ? (
            <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-[24px] border border-stone-200">
              <Image
                src={heroBlock.imagePath}
                alt={heroBlock.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          ) : null}
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
            {bodyBlock?.contentTranslations?.[locale] ?? bodyBlock?.content}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featureBlocks.map((block, index) => (
            <div key={index} className="rounded-[24px] border border-stone-200 bg-white p-5">
              <p className="text-sm leading-7 text-stone-600">
                {block?.contentTranslations?.[locale] ?? block?.content}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-stone-200 bg-white"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <h2 className="text-2xl font-semibold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <InquiryForm title={t(locale, "customInquiry")} />
    </div>
  );
}
