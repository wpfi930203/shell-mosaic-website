import type { CurrencyCode } from "@/lib/types";

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
};

export function formatMoney(value: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}
