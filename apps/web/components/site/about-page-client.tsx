"use client";

import Image from "next/image";

import { usePreferences } from "@/components/providers/preferences-provider";
import { getPageBlock, t } from "@/lib/i18n";
import type { SiteData } from "@/lib/types";

export function AboutPageClient({ siteData }: { siteData: SiteData }) {
  const { locale } = usePreferences();
  const heroBlock = getPageBlock(siteData.managedPages, "/about", "about-hero-title");
  const bodyBlock = getPageBlock(siteData.managedPages, "/about", "about-body");
  const paragraphs = (bodyBlock?.contentTranslations?.[locale] ?? bodyBlock?.content ?? "")
    .split("\n\n")
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="rounded-[30px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          {heroBlock?.titleTranslations?.[locale] ?? heroBlock?.title ?? t(locale, "aboutUs")}
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
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        ) : null}
        <div className="prose-rich mt-6 space-y-4 text-base leading-8 text-stone-600">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
