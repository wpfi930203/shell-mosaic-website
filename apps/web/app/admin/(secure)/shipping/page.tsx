"use client";

import { useSiteData } from "@/components/admin/use-site-data";
import type { ShippingGroup, ShippingMethod, ShippingMode } from "@/lib/types";

const shippingModeOptions: { value: ShippingMode; label: string }[] = [
  { value: "international_express", label: "International Express" },
  { value: "air_freight", label: "Air Freight" },
  { value: "sea_freight", label: "Sea Freight" },
  { value: "sample_courier", label: "Sample Courier" },
];

const shippingGroupOptions: { value: ShippingGroup; label: string }[] = [
  { value: "standard", label: "Standard (box / piece orders)" },
  { value: "sample", label: "Sample (swatch / sample orders)" },
];

function createShippingMethod(order: number): ShippingMethod {
  const now = new Date().toISOString();

  return {
    id: `ship-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: "New Shipping Method",
    description: "7-12 business days",
    price: 0,
    freeThreshold: 0,
    displayOrder: order,
    shippingMode: "international_express",
    shippingGroup: "standard",
    trackingUrlTemplate: "https://www.17track.net/en/track?nums={trackingNumber}",
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };
}

export default function AdminShippingPage() {
  const { data, save, status } = useSiteData();

  if (!data) {
    return <div className="rounded-[28px] border border-stone-200 bg-white p-8">{status}</div>;
  }

  // `data` is non-null from here on. Capture it in a const so the nested
  // handlers below keep the narrowed type (TypeScript widens captured
  // variables back to their declared type inside function declarations).
  const siteData = data;
  const shippingMethods = [...siteData.shippingMethods].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  function updateMethod(id: string, updater: (method: ShippingMethod) => ShippingMethod) {
    const nextMethods = shippingMethods.map((method) =>
      method.id === id ? { ...updater(method), updatedAt: new Date().toISOString() } : method,
    );

    save({ ...siteData, shippingMethods: nextMethods });
  }

  function removeMethod(id: string) {
    const nextMethods = shippingMethods
      .filter((method) => method.id !== id)
      .map((method, index) => ({ ...method, displayOrder: index + 1 }));

    save({ ...siteData, shippingMethods: nextMethods });
  }

  function addMethod() {
    const nextMethods = [...shippingMethods, createShippingMethod(shippingMethods.length + 1)];
    save({ ...siteData, shippingMethods: nextMethods });
  }

  function moveMethod(id: string, direction: -1 | 1) {
    const index = shippingMethods.findIndex((method) => method.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= shippingMethods.length) {
      return;
    }

    const nextMethods = [...shippingMethods];
    const current = nextMethods[index];
    const target = nextMethods[nextIndex];

    nextMethods[index] = { ...target, displayOrder: index + 1, updatedAt: new Date().toISOString() };
    nextMethods[nextIndex] = {
      ...current,
      displayOrder: nextIndex + 1,
      updatedAt: new Date().toISOString(),
    };

    save({ ...siteData, shippingMethods: nextMethods });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-stone-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Shipping</p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-900">
              Manage international delivery methods.
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-stone-500">
              Configure international express, air freight, sea freight and sample courier
              services. Each method includes its own price, free shipping threshold, tracking
              template and display order.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-500">{status}</p>
            <button
              type="button"
              onClick={addMethod}
              className="mt-3 min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Add Shipping Method
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {shippingMethods.map((method, index) => (
          <div key={method.id} className="rounded-[28px] border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-stone-900">{method.name}</p>
                <p className="text-sm text-stone-500">
                  Display order {method.displayOrder} · Updated {new Date(method.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeMethod(method.id)}
                className="min-h-11 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Delete
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Name" value={method.name} onChange={(value) => updateMethod(method.id, (current) => ({ ...current, name: value }))} />
              <Field
                label="Description"
                value={method.description}
                onChange={(value) => updateMethod(method.id, (current) => ({ ...current, description: value }))}
              />
              <NumberField
                label="Display Order"
                value={method.displayOrder}
                onChange={(value) => updateMethod(method.id, (current) => ({ ...current, displayOrder: value }))}
              />
              <NumberField
                label="Price"
                value={method.price}
                step={0.01}
                onChange={(value) => updateMethod(method.id, (current) => ({ ...current, price: value }))}
              />
              <NumberField
                label="Free Shipping Threshold"
                value={method.freeThreshold}
                step={0.01}
                onChange={(value) =>
                  updateMethod(method.id, (current) => ({ ...current, freeThreshold: value }))
                }
              />
              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Logistics Type</span>
                <select
                  value={method.shippingMode}
                  onChange={(event) =>
                    updateMethod(method.id, (current) => ({
                      ...current,
                      shippingMode: event.target.value as ShippingMode,
                    }))
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  {shippingModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-stone-800">Shipping Group</span>
                <select
                  value={method.shippingGroup ?? "standard"}
                  onChange={(event) =>
                    updateMethod(method.id, (current) => ({
                      ...current,
                      shippingGroup: event.target.value as ShippingGroup,
                    }))
                  }
                  className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
                >
                  {shippingGroupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Tracking URL Template"
                value={method.trackingUrlTemplate ?? ""}
                onChange={(value) =>
                  updateMethod(method.id, (current) => ({ ...current, trackingUrlTemplate: value }))
                }
                placeholder="https://www.17track.net/en/track?nums={trackingNumber}"
                className="md:col-span-2 xl:col-span-2"
              />
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-800">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={(event) =>
                    updateMethod(method.id, (current) => ({ ...current, enabled: event.target.checked }))
                  }
                />
                Enable this method at checkout
              </label>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => moveMethod(method.id, -1)}
                disabled={index === 0}
                className="min-h-11 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Move Up
              </button>
              <button
                type="button"
                onClick={() => moveMethod(method.id, 1)}
                disabled={index === shippingMethods.length - 1}
                className="min-h-11 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Move Down
              </button>
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
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
      />
    </label>
  );
}
