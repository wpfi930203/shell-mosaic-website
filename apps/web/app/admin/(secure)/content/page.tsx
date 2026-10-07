"use client";

import { useState } from "react";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useSiteData } from "@/components/admin/use-site-data";
import { localeLabels } from "@/lib/i18n";
import type { LocaleCode, LocalizedText } from "@/lib/types";

const pageSortOrder = ["/", "/custom", "/gallery", "/contact", "/about"];

export default function AdminContentPage() {
  const { data, save, status } = useSiteData();
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("zh");

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  const orderedPages = [...data.managedPages].sort(
    (a, b) => pageSortOrder.indexOf(a.slug) - pageSortOrder.indexOf(b.slug),
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Content</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">Owner content manager.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
          Edit the most important website content from one place: brand name, homepage banners,
          menus, footer, contact information and all page text blocks.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-stone-500">Current status: {status}</p>
          <label className="flex items-center gap-3 text-sm font-medium text-stone-700">
            Editing language
            <select
              value={activeLocale}
              onChange={(event) => setActiveLocale(event.target.value as LocaleCode)}
              className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            >
              {data.settings.enabledLocales.map((locale) => (
                <option key={locale} value={locale}>
                  {localeLabels[locale]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Brand</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={data.settings.brandName}
            onChange={(event) =>
              save({
                ...data,
                settings: { ...data.settings, brandName: event.target.value },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            placeholder="Brand name"
          />
          <input
            value={data.settings.storeName}
            onChange={(event) =>
              save({
                ...data,
                settings: { ...data.settings, storeName: event.target.value },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            placeholder="Store name (English base)"
          />
          <input
            value={data.settings.storeNameTranslations?.[activeLocale] ?? ""}
            onChange={(event) =>
              save({
                ...data,
                settings: {
                  ...data.settings,
                  storeNameTranslations: updateTranslation(
                    data.settings.storeNameTranslations,
                    activeLocale,
                    event.target.value,
                  ),
                },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
            placeholder={`Store name (${activeLocale})`}
          />
          <select
            value={data.settings.logoType}
            onChange={(event) =>
              save({
                ...data,
                settings: {
                  ...data.settings,
                  logoType: event.target.value as "text" | "image",
                },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="text">Text Logo</option>
            <option value="image">Image Logo</option>
          </select>
          <input
            value={data.settings.logoText}
            onChange={(event) =>
              save({
                ...data,
                settings: { ...data.settings, logoText: event.target.value },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            placeholder="Logo text"
          />
          <input
            type="number"
            min={40}
            value={data.settings.logoWidth}
            onChange={(event) =>
              save({
                ...data,
                settings: {
                  ...data.settings,
                  logoWidth: Number(event.target.value),
                },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            placeholder="Logo width"
          />
          <input
            type="number"
            min={20}
            value={data.settings.logoHeight}
            onChange={(event) =>
              save({
                ...data,
                settings: {
                  ...data.settings,
                  logoHeight: Number(event.target.value),
                },
              })
            }
            className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
            placeholder="Logo height"
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label="Brand logo image"
              value={data.settings.logoPath}
              helperText="Upload a logo and switch logo type to Image."
              onChange={(value) =>
                save({
                  ...data,
                  settings: { ...data.settings, logoPath: value },
                })
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Main Navigation</h2>
        <div className="mt-6 space-y-4">
          {data.mainMenu.map((item, index) => (
            <div key={item.id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={item.label}
                  onChange={(event) => {
                    const nextMenu = [...data.mainMenu];
                    nextMenu[index] = { ...item, label: event.target.value };
                    save({ ...data, mainMenu: nextMenu });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Menu label (English base)"
                />
                <input
                  value={item.labelTranslations?.[activeLocale] ?? ""}
                  onChange={(event) => {
                    const nextMenu = [...data.mainMenu];
                    nextMenu[index] = {
                      ...item,
                      labelTranslations: updateTranslation(
                        item.labelTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, mainMenu: nextMenu });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Menu label (${activeLocale})`}
                />
                <input
                  value={item.href}
                  onChange={(event) => {
                    const nextMenu = [...data.mainMenu];
                    nextMenu[index] = { ...item, href: event.target.value };
                    save({ ...data, mainMenu: nextMenu });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Menu link"
                />
                <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(event) => {
                      const nextMenu = [...data.mainMenu];
                      nextMenu[index] = { ...item, enabled: event.target.checked };
                      save({ ...data, mainMenu: nextMenu });
                    }}
                  />
                  Enabled
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-stone-900">Homepage Banners</h2>
          <button
            type="button"
            onClick={() =>
              save({
                ...data,
                banners: [
                  ...data.banners,
                  {
                    id: `banner-${Date.now()}`,
                    title: "New Banner",
                    subtitle: "Add your campaign copy here.",
                    image: "",
                    href: "/shop",
                    enabled: true,
                    sortOrder: data.banners.length + 1,
                  },
                ],
              })
            }
            className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Add Banner
          </button>
        </div>
        <div className="mt-6 space-y-5">
          {data.banners.map((banner, index) => (
            <div key={banner.id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={banner.title}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = { ...banner, title: event.target.value };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Banner title (English base)"
                />
                <input
                  value={banner.titleTranslations?.[activeLocale] ?? ""}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = {
                      ...banner,
                      titleTranslations: updateTranslation(
                        banner.titleTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Banner title (${activeLocale})`}
                />
                <textarea
                  value={banner.subtitle}
                  rows={3}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = { ...banner, subtitle: event.target.value };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Banner subtitle (English base)"
                />
                <textarea
                  value={banner.subtitleTranslations?.[activeLocale] ?? ""}
                  rows={3}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = {
                      ...banner,
                      subtitleTranslations: updateTranslation(
                        banner.subtitleTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Banner subtitle (${activeLocale})`}
                />
                <input
                  value={banner.href}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = { ...banner, href: event.target.value };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Banner link"
                />
                <input
                  type="number"
                  value={banner.sortOrder}
                  onChange={(event) => {
                    const nextBanners = [...data.banners];
                    nextBanners[index] = {
                      ...banner,
                      sortOrder: Number(event.target.value),
                    };
                    save({ ...data, banners: nextBanners });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Sort order"
                />
                <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={banner.enabled}
                    onChange={(event) => {
                      const nextBanners = [...data.banners];
                      nextBanners[index] = { ...banner, enabled: event.target.checked };
                      save({ ...data, banners: nextBanners });
                    }}
                  />
                  Enabled
                </label>
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Banner image"
                    value={banner.image}
                    helperText="Used on the homepage carousel."
                    onChange={(value) => {
                      const nextBanners = [...data.banners];
                      nextBanners[index] = { ...banner, image: value };
                      save({ ...data, banners: nextBanners });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-stone-900">Gallery Images</h2>
          <button
            type="button"
            onClick={() =>
              save({
                ...data,
                galleryItems: [
                  ...data.galleryItems,
                  {
                    id: `gallery-${Date.now()}`,
                    title: "New Project",
                    category: "Residential",
                    image: "",
                    description: "Add the project story here.",
                  },
                ],
              })
            }
            className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Add Gallery Image
          </button>
        </div>
        <div className="mt-6 space-y-5">
          {data.galleryItems.map((item, index) => (
            <div key={item.id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={item.title}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = { ...item, title: event.target.value };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Title (English base)"
                />
                <input
                  value={item.titleTranslations?.[activeLocale] ?? ""}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = {
                      ...item,
                      titleTranslations: updateTranslation(
                        item.titleTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Title (${activeLocale})`}
                />
                <input
                  value={item.category}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = { ...item, category: event.target.value };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Category (English base)"
                />
                <input
                  value={item.categoryTranslations?.[activeLocale] ?? ""}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = {
                      ...item,
                      categoryTranslations: updateTranslation(
                        item.categoryTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Category (${activeLocale})`}
                />
                <textarea
                  value={item.description}
                  rows={3}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = { ...item, description: event.target.value };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Description (English base)"
                />
                <textarea
                  value={item.descriptionTranslations?.[activeLocale] ?? ""}
                  rows={3}
                  onChange={(event) => {
                    const nextItems = [...data.galleryItems];
                    nextItems[index] = {
                      ...item,
                      descriptionTranslations: updateTranslation(
                        item.descriptionTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, galleryItems: nextItems });
                  }}
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Description (${activeLocale})`}
                />
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Gallery image"
                    value={item.image}
                    helperText="Used on gallery and custom pages."
                    onChange={(value) => {
                      const nextItems = [...data.galleryItems];
                      nextItems[index] = { ...item, image: value };
                      save({ ...data, galleryItems: nextItems });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Footer</h2>
        <div className="mt-6 space-y-6">
          {data.footerSections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={section.title}
                  onChange={(event) => {
                    const nextSections = [...data.footerSections];
                    nextSections[sectionIndex] = { ...section, title: event.target.value };
                    save({ ...data, footerSections: nextSections });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder="Section title (English base)"
                />
                <input
                  value={section.titleTranslations?.[activeLocale] ?? ""}
                  onChange={(event) => {
                    const nextSections = [...data.footerSections];
                    nextSections[sectionIndex] = {
                      ...section,
                      titleTranslations: updateTranslation(
                        section.titleTranslations,
                        activeLocale,
                        event.target.value,
                      ),
                    };
                    save({ ...data, footerSections: nextSections });
                  }}
                  className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={`Section title (${activeLocale})`}
                />
              </div>

              <div className="mt-5 space-y-4">
                {section.links.map((link, linkIndex) => (
                  <div key={link.id} className="grid gap-4 md:grid-cols-3">
                    <input
                      value={link.label}
                      onChange={(event) => {
                        const nextSections = [...data.footerSections];
                        const nextLinks = [...section.links];
                        nextLinks[linkIndex] = { ...link, label: event.target.value };
                        nextSections[sectionIndex] = { ...section, links: nextLinks };
                        save({ ...data, footerSections: nextSections });
                      }}
                      className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                      placeholder="Link label (English base)"
                    />
                    <input
                      value={link.labelTranslations?.[activeLocale] ?? ""}
                      onChange={(event) => {
                        const nextSections = [...data.footerSections];
                        const nextLinks = [...section.links];
                        nextLinks[linkIndex] = {
                          ...link,
                          labelTranslations: updateTranslation(
                            link.labelTranslations,
                            activeLocale,
                            event.target.value,
                          ),
                        };
                        nextSections[sectionIndex] = { ...section, links: nextLinks };
                        save({ ...data, footerSections: nextSections });
                      }}
                      className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                      placeholder={`Link label (${activeLocale})`}
                    />
                    <input
                      value={link.href}
                      onChange={(event) => {
                        const nextSections = [...data.footerSections];
                        const nextLinks = [...section.links];
                        nextLinks[linkIndex] = { ...link, href: event.target.value };
                        nextSections[sectionIndex] = { ...section, links: nextLinks };
                        save({ ...data, footerSections: nextSections });
                      }}
                      className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                      placeholder="Link URL"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Pages</h2>
        <div className="mt-6 space-y-6">
          {orderedPages.map((page) => {
            const pageIndex = data.managedPages.findIndex((candidate) => candidate.id === page.id);
            return (
              <div key={page.id} className="rounded-[24px] border border-stone-200 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={page.name}
                    onChange={(event) => {
                      const nextPages = [...data.managedPages];
                      nextPages[pageIndex] = { ...page, name: event.target.value };
                      save({ ...data, managedPages: nextPages });
                    }}
                    className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                    placeholder="Page name (English base)"
                  />
                  <input
                    value={page.nameTranslations?.[activeLocale] ?? ""}
                    onChange={(event) => {
                      const nextPages = [...data.managedPages];
                      nextPages[pageIndex] = {
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
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Page thumbnail / hero image"
                      value={page.thumbnail}
                      helperText="Use this for page cards or future hero visuals."
                      onChange={(value) => {
                        const nextPages = [...data.managedPages];
                        nextPages[pageIndex] = { ...page, thumbnail: value };
                        save({ ...data, managedPages: nextPages });
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {page.blocks.map((block, blockIndex) => (
                    <div key={block.id} className="rounded-[20px] bg-stone-50 p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.25em] text-stone-500">
                        {block.id}
                      </p>
                      <div className="grid gap-4">
                        <input
                          value={block.title}
                          onChange={(event) => {
                            const nextPages = [...data.managedPages];
                            const nextBlocks = [...page.blocks];
                            nextBlocks[blockIndex] = { ...block, title: event.target.value };
                            nextPages[pageIndex] = { ...page, blocks: nextBlocks };
                            save({ ...data, managedPages: nextPages });
                          }}
                          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                          placeholder="Block title (English base)"
                        />
                        <input
                          value={block.titleTranslations?.[activeLocale] ?? ""}
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
                            nextPages[pageIndex] = { ...page, blocks: nextBlocks };
                            save({ ...data, managedPages: nextPages });
                          }}
                          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
                          placeholder={`Block title (${activeLocale})`}
                        />
                        <textarea
                          value={block.content}
                          rows={4}
                          onChange={(event) => {
                            const nextPages = [...data.managedPages];
                            const nextBlocks = [...page.blocks];
                            nextBlocks[blockIndex] = { ...block, content: event.target.value };
                            nextPages[pageIndex] = { ...page, blocks: nextBlocks };
                            save({ ...data, managedPages: nextPages });
                          }}
                          className="rounded-2xl border border-stone-200 px-4 py-3"
                          placeholder="Block content (English base)"
                        />
                        <textarea
                          value={block.contentTranslations?.[activeLocale] ?? ""}
                          rows={4}
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
                            nextPages[pageIndex] = { ...page, blocks: nextBlocks };
                            save({ ...data, managedPages: nextPages });
                          }}
                          className="rounded-2xl border border-stone-200 px-4 py-3"
                          placeholder={`Block content (${activeLocale})`}
                        />
                        <ImageUploadField
                          label={`Block image: ${block.id}`}
                          value={block.imagePath ?? ""}
                          helperText="Use for page hero images, supporting visuals or section illustrations."
                          onChange={(value) => {
                            const nextPages = [...data.managedPages];
                            const nextBlocks = [...page.blocks];
                            nextBlocks[blockIndex] = { ...block, imagePath: value };
                            nextPages[pageIndex] = { ...page, blocks: nextBlocks };
                            save({ ...data, managedPages: nextPages });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
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
