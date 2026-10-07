"use client";

import Image from "next/image";

import { usePreferences } from "@/components/providers/preferences-provider";
import { InquiryForm } from "@/components/site/inquiry-form";
import { getPageBlock, t } from "@/lib/i18n";
import type { SiteData } from "@/lib/types";

export function ContactPageClient({ siteData }: { siteData: SiteData }) {
  const { locale } = usePreferences();
  const heroBlock = getPageBlock(siteData.managedPages, "/contact", "contact-hero-title");
  const detailsBlock = getPageBlock(siteData.managedPages, "/contact", "contact-details");
  const details = (
    detailsBlock?.contentTranslations?.[locale] ??
    detailsBlock?.content ??
    "Email: hello@lansictiles.com\nWhatsApp: +86 180 0000 0000\nOffice hours: Monday - Friday / 09:00 - 18:00 CST"
  )
    .split("\n")
    .filter(Boolean);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <section className="rounded-[30px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
          {heroBlock?.titleTranslations?.[locale] ?? heroBlock?.title ?? t(locale, "contact")}
        </p>
        <h1 className="mt-2 text-5xl font-semibold text-stone-900">
          {heroBlock?.contentTranslations?.[locale] ?? heroBlock?.content}
        </h1>
        {heroBlock?.imagePath ? (
          <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[24px] border border-stone-200">
            <Image
              src={heroBlock.imagePath}
              alt={heroBlock.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        ) : null}
        <div className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
          {details.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
      <InquiryForm title={t(locale, "contactRequest")} />
    </div>
  );
}
