"use client";

import { useState } from "react";

import { usePreferences } from "@/components/providers/preferences-provider";
import { formatUiText, t } from "@/lib/i18n";

export function InquiryForm({ title }: { title: string }) {
  const { locale } = usePreferences();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    applicationScene: "",
    budgetRange: "",
  });
  const [message, setMessage] = useState("");

  async function submit() {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage(
      response.ok
        ? formatUiText(locale, "inquirySubmitted", { title })
        : t(locale, "submissionFailed"),
    );
  }

  return (
    <div className="rounded-[30px] border border-stone-200 bg-white p-8">
      <h2 className="text-3xl font-semibold text-stone-900">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          placeholder={t(locale, "fullName")}
          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          placeholder={t(locale, "email")}
          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        <input
          placeholder={t(locale, "phone")}
          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
          value={form.phone}
          onChange={(event) =>
            setForm((current) => ({ ...current, phone: event.target.value }))
          }
        />
        <input
          placeholder={t(locale, "applicationScene")}
          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3"
          value={form.applicationScene}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              applicationScene: event.target.value,
            }))
          }
        />
        <input
          placeholder={t(locale, "budgetRange")}
          className="min-h-11 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
          value={form.budgetRange}
          onChange={(event) =>
            setForm((current) => ({ ...current, budgetRange: event.target.value }))
          }
        />
        <textarea
          placeholder={t(locale, "messageLabel")}
          rows={5}
          className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2"
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="mt-5 min-h-11 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
      >
        {t(locale, "submit")}
      </button>
      {message ? <p className="mt-4 text-sm text-emerald-900">{message}</p> : null}
    </div>
  );
}
