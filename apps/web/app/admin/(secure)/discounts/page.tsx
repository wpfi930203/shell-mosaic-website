"use client";

import { useSiteData } from "@/components/admin/use-site-data";
import type { DiscountCode, DiscountType } from "@/lib/types";

const discountTypeOptions: { value: DiscountType; label: string }[] = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
  { value: "free_shipping", label: "Free Shipping" },
];

function createDiscountCode(): DiscountCode {
  const now = new Date().toISOString();

  return {
    id: `discount-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    code: "NEWCODE",
    type: "percentage",
    value: 10,
    minOrder: 0,
    startsAt: now,
    expiresAt: "",
    usageLimit: 0,
    usedCount: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export default function AdminDiscountsPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  // `data` is non-null from here on. Capture it in a const so the nested
  // handlers below keep the narrowed type (TypeScript widens captured
  // variables back to their declared type inside function declarations).
  const siteData = data;
  const discountCodes = [...siteData.discountCodes].sort((a, b) => a.code.localeCompare(b.code));

  function updateCode(id: string, updater: (code: DiscountCode) => DiscountCode) {
    save({
      ...siteData,
      discountCodes: discountCodes.map((code) =>
        code.id === id ? { ...updater(code), updatedAt: new Date().toISOString() } : code,
      ),
    });
  }

  function removeCode(id: string) {
    save({
      ...siteData,
      discountCodes: discountCodes.filter((code) => code.id !== id),
    });
  }

  function addCode() {
    save({
      ...siteData,
      discountCodes: [...discountCodes, createDiscountCode()],
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Discounts</p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-900">
              Manage cart promotions and shipping incentives.
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-stone-500">
              Codes are validated in cart and checkout against status, minimum order, active date
              range and usage limit.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">{status}</p>
            <button
              type="button"
              onClick={addCode}
              className="mt-3 min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Add Discount Code
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {discountCodes.map((code) => (
          <div key={code.id} className="rounded-[28px] border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-stone-900">{code.code}</p>
                <p className="text-sm text-stone-500">
                  Used {code.usedCount} / {code.usageLimit || "unlimited"} · Updated{" "}
                  {new Date(code.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeCode(code.id)}
                className="min-h-11 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Delete
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field
                label="Code"
                value={code.code}
                onChange={(value) => updateCode(code.id, (current) => ({ ...current, code: value.toUpperCase() }))}
              />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Type</span>
                <select
                  value={code.type}
                  onChange={(event) =>
                    updateCode(code.id, (current) => ({
                      ...current,
                      type: event.target.value as DiscountType,
                    }))
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  {discountTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField
                label="Value"
                value={code.value}
                onChange={(value) => updateCode(code.id, (current) => ({ ...current, value }))}
              />
              <NumberField
                label="Minimum Order"
                value={code.minOrder}
                onChange={(value) => updateCode(code.id, (current) => ({ ...current, minOrder: value }))}
              />
              <Field
                label="Starts At"
                value={toDateTimeLocal(code.startsAt)}
                onChange={(value) =>
                  updateCode(code.id, (current) => ({
                    ...current,
                    startsAt: value ? new Date(value).toISOString() : "",
                  }))
                }
                type="datetime-local"
              />
              <Field
                label="Expires At"
                value={toDateTimeLocal(code.expiresAt)}
                onChange={(value) =>
                  updateCode(code.id, (current) => ({
                    ...current,
                    expiresAt: value ? new Date(value).toISOString() : "",
                  }))
                }
                type="datetime-local"
              />
              <NumberField
                label="Usage Limit"
                value={code.usageLimit}
                onChange={(value) => updateCode(code.id, (current) => ({ ...current, usageLimit: value }))}
              />
              <NumberField
                label="Used Count"
                value={code.usedCount}
                onChange={(value) => updateCode(code.id, (current) => ({ ...current, usedCount: value }))}
              />
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={code.isActive}
                  onChange={(event) =>
                    updateCode(code.id, (current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                Enable this code
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "datetime-local";
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        type="number"
        value={value}
        step={0.01}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
      />
    </label>
  );
}

function toDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
