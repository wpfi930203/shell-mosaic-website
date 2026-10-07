"use client";

import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { localizeFooterSection, t } from "@/lib/i18n";
import type { FooterSection } from "@/lib/types";

export function SiteFooter({
  footerSections,
  socialLinks,
}: {
  footerSections: FooterSection[];
  socialLinks: { id: string; label: string; href: string }[];
}) {
  const { locale } = usePreferences();

  return (
    <footer className="mt-20 border-t border-stone-200 bg-stone-950 text-stone-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
            {t(locale, "social")}
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-stone-300 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {footerSections.map((section) => {
          const localizedSection = localizeFooterSection(section, locale);
          return (
          <div key={section.id}>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
              {localizedSection.title}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {localizedSection.links.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-sm text-stone-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )})}
      </div>
    </footer>
  );
}
