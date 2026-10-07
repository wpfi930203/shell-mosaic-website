import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminSecureLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f0e8] text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[28px] border border-stone-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Lansic Admin</p>
          <nav className="mt-6 flex flex-col gap-3">
            {[
              ["/admin/content", "Content"],
              ["/admin", "Dashboard"],
              ["/admin/products", "Products"],
              ["/admin/orders", "Orders"],
              ["/admin/shipping", "Shipping"],
              ["/admin/discounts", "Discounts"],
              ["/admin/reviews", "Reviews"],
              ["/admin/customers", "Customers"],
              ["/admin/navigation", "Navigation"],
              ["/admin/banners", "Banners"],
              ["/admin/pages", "Pages"],
              ["/admin/settings", "Settings"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
