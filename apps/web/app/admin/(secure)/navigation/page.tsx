"use client";

import { useSiteData } from "@/components/admin/use-site-data";

export default function AdminNavigationPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Navigation</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">
          Edit top menu and footer links.
        </h1>
        <p className="mt-3 text-sm text-stone-500">{status}</p>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Main Menu</h2>
        <div className="mt-6 space-y-4">
          {data.mainMenu.map((item, index) => (
            <div key={item.id} className="grid gap-4 md:grid-cols-3">
              <input
                value={item.label}
                onChange={(event) => {
                  const nextMenu = [...data.mainMenu];
                  nextMenu[index] = { ...item, label: event.target.value };
                  save({ ...data, mainMenu: nextMenu });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
              />
              <input
                value={item.href}
                onChange={(event) => {
                  const nextMenu = [...data.mainMenu];
                  nextMenu[index] = { ...item, href: event.target.value };
                  save({ ...data, mainMenu: nextMenu });
                }}
                className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
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
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <h2 className="text-3xl font-semibold text-stone-900">Footer Sections</h2>
        <div className="mt-6 space-y-6">
          {data.footerSections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-[24px] border border-stone-200 p-5">
              <input
                value={section.title}
                onChange={(event) => {
                  const nextSections = [...data.footerSections];
                  nextSections[sectionIndex] = { ...section, title: event.target.value };
                  save({ ...data, footerSections: nextSections });
                }}
                className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
