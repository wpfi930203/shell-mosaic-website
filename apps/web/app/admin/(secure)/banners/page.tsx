"use client";

import { useSiteData } from "@/components/admin/use-site-data";

export default function AdminBannersPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Banners</p>
      <h1 className="mt-2 text-4xl font-semibold text-stone-900">Homepage hero manager.</h1>
      <p className="mt-3 text-sm text-stone-500">{status}</p>
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
              />
              <input
                value={banner.href}
                onChange={(event) => {
                  const nextBanners = [...data.banners];
                  nextBanners[index] = { ...banner, href: event.target.value };
                  save({ ...data, banners: nextBanners });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              />
              <textarea
                value={banner.subtitle}
                rows={3}
                onChange={(event) => {
                  const nextBanners = [...data.banners];
                  nextBanners[index] = { ...banner, subtitle: event.target.value };
                  save({ ...data, banners: nextBanners });
                }}
                className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
