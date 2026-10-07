"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { localeLabels } from "@/lib/i18n";
import { createLocalStorageStore } from "@/lib/local-storage-store";
import type { CurrencyCode, LocaleCode } from "@/lib/types";

interface PreferencesContextValue {
  locale: LocaleCode;
  currency: CurrencyCode;
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const localeStore = createLocalStorageStore<string | null>({
  storageKey: "lansic-locale",
  emptyValue: null,
  parse: (raw) => raw,
  stringify: (value) => value ?? "",
});

const currencyStore = createLocalStorageStore<string | null>({
  storageKey: "lansic-currency",
  emptyValue: null,
  parse: (raw) => raw,
  stringify: (value) => value ?? "",
});

function isLocaleCode(value: string | null): value is LocaleCode {
  return value !== null && Object.hasOwn(localeLabels, value);
}

function isCurrencyCode(value: string | null): value is CurrencyCode {
  return value === "USD" || value === "EUR";
}

export function PreferencesProvider({
  children,
  defaultLocale,
  defaultCurrency,
}: {
  children: ReactNode;
  defaultLocale: LocaleCode;
  defaultCurrency: CurrencyCode;
}) {
  const storedLocale = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.read,
    localeStore.getServerSnapshot,
  );
  const storedCurrency = useSyncExternalStore(
    currencyStore.subscribe,
    currencyStore.read,
    currencyStore.getServerSnapshot,
  );

  const locale = isLocaleCode(storedLocale) ? storedLocale : defaultLocale;
  const currency = isCurrencyCode(storedCurrency) ? storedCurrency : defaultCurrency;

  const setLocale = useCallback((next: LocaleCode) => {
    localeStore.set(() => next);
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    currencyStore.set(() => next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      currency,
      setLocale,
      setCurrency,
    }),
    [currency, locale, setCurrency, setLocale],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider.");
  }
  return context;
}
