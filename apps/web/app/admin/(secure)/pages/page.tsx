"use client";

import { useState } from "react";

import { useSiteData } from "@/components/admin/use-site-data";
import { localeLabels } from "@/lib/i18n";
import type { LocaleCode, LocalizedText } from "@/lib/types";

export default function AdminPagesPage() {
  const { data, save, status } = useSiteData();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("en");

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Pages</p>
      <h1 className="mt-2 text-4xl font-semibold text-stone-900">
        Multi-language page manager.
      </h1>
      <p className="mt-3 text-sm text-stone-500">{status}</p>
      <div className="mt-4 max-w-xs">
        <select
          value={activeLocale}
          onChange={(event) => setActiveLocale(event.target.value as LocaleCode)}
          className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
        >
          {data.settings.enabledLocales.map((locale) => (
            <option key={locale} value={locale}>
              {localeLabels[locale]}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6 space-y-5">
        {data.managedPages.map((page, index) => (
          <div key={page.id} className="rounded-[24px] border border-stone-200 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={page.name}
                onChange={(event) => {
                  const nextPages = [...data.managedPages];
                  nextPages[index] = { ...page, name: event.target.value };
                  save({ ...data, managedPages: nextPages });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                value={page.nameTranslations?.[activeLocale] ?? ""}
                onChange={(event) => {
                  const nextPages = [...data.managedPages];
                  nextPages[index] = {
                    ...page,
                    nameTranslations: updateTranslation(
                      page.nameTranslations,
                      activeLocale,
                      event.target.value,
                    ),
                  };
                  save({ ...data, managedPages: nextPages });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                placeholder={`Page name (${activeLocale})`}
              />
              <input
                value={page.slug}
                onChange={(event) => {
                  const nextPages = [...data.managedPages];
                  nextPages[index] = { ...page, slug: event.target.value };
                  save({ ...data, managedPages: nextPages });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              />
            </div>
            <div className="mt-5 space-y-4">
              {page.blocks.map((block, blockIndex) => (
                <div key={block.id} className="rounded-[20px] bg-stone-50 p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-stone-500">
                    {block.id}
                  </p>
                  <div className="grid gap-4">
                    <input
                      value={block.titleTranslations?.[activeLocale] ?? block.title}
                      onChange={(event) => {
                        const nextPages = [...data.managedPages];
                        const nextBlocks = [...page.blocks];
                        nextBlocks[blockIndex] = {
                          ...block,
                          titleTranslations: updateTranslation(
                            block.titleTranslations,
                            activeLocale,
                            event.target.value,
                          ),
                        };
                        nextPages[index] = { ...page, blocks: nextBlocks };
                        save({ ...data, managedPages: nextPages });
                      }}
                      className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                      placeholder={`Block title (${activeLocale})`}
                    />
                    <textarea
                      value={block.contentTranslations?.[activeLocale] ?? block.content}
                      onChange={(event) => {
                        const nextPages = [...data.managedPages];
                        const nextBlocks = [...page.blocks];
                        nextBlocks[blockIndex] = {
                          ...block,
                          contentTranslations: updateTranslation(
                            block.contentTranslations,
                            activeLocale,
                            event.target.value,
                          ),
                        };
                        nextPages[index] = { ...page, blocks: nextBlocks };
                        save({ ...data, managedPages: nextPages });
                      }}
                      className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3"
                      placeholder={`Block content (${activeLocale})`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function updateTranslation(
  current: LocalizedText | undefined,
  locale: LocaleCode,
  value: string,
) {
  return {
    ...(current ?? {}),
    [locale]: value,
  };
}
