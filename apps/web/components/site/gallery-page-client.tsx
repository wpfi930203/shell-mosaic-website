"use client";

import Image from "next/image";

import { usePreferences } from "@/components/providers/preferences-provider";
import { getPageBlock, localizeGalleryItem, t } from "@/lib/i18n";
import type { SiteData } from "@/lib/types";

export function GalleryPageClient({ siteData }: { siteData: SiteData }) {
  const { locale } = usePreferences();
  const heroBlock = getPageBlock(siteData.managedPages, "/gallery", "gallery-hero-title");
  const items = siteData.galleryItems.map((item) => localizeGalleryItem(item, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="rounded-[30px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          {heroBlock?.titleTranslations?.[locale] ?? heroBlock?.title ?? t(locale, "gallery")}
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
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[28px] border border-stone-200 bg-white"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                {item.category}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
