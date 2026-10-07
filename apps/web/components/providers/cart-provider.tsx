"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { createLocalStorageStore } from "@/lib/local-storage-store";
import type { CartItemInput, PurchaseMode } from "@/lib/types";

interface PersistedCartState {
  items: CartItemInput[];
  shippingMethodId: string;
  discountCode: string;
}

interface CartContextValue {
  items: CartItemInput[];
  shippingMethodId: string;
  discountCode: string;
  itemCount: number;
  isDrawerOpen: boolean;
  addItem: (item: CartItemInput) => void;
  removeItem: (productId: string, pricingMode: PurchaseMode, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    pricingMode: PurchaseMode,
    variantId: string | undefined,
    quantity: number,
  ) => void;
  setShippingMethodId: (shippingMethodId: string) => void;
  setDiscountCode: (discountCode: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart: PersistedCartState = {
  items: [],
  shippingMethodId: "",
  discountCode: "",
};

function parsePersistedCart(raw: string | null): PersistedCartState {
  if (!raw) {
    return emptyCart;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedCartState | CartItemInput[];

    if (Array.isArray(parsed)) {
      return { ...emptyCart, items: parsed };
    }

    return {
      items: parsed.items ?? [],
      shippingMethodId: parsed.shippingMethodId ?? "",
      discountCode: parsed.discountCode ?? "",
    };
  } catch {
    return emptyCart;
  }
}

const cartStore = createLocalStorageStore<PersistedCartState>({
  storageKey: "lansic-cart",
  emptyValue: emptyCart,
  parse: parsePersistedCart,
  stringify: (value) => JSON.stringify(value),
});

function isSameLine(
  candidate: CartItemInput,
  productId: string,
  pricingMode: PurchaseMode,
  variantId: string | undefined,
) {
  return (
    candidate.productId === productId &&
    candidate.pricingMode === pricingMode &&
    candidate.variantId === variantId
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { items, shippingMethodId, discountCode } = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.read,
    cartStore.getServerSnapshot,
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      shippingMethodId,
      discountCode,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      isDrawerOpen,
      addItem: (item) => {
        setDrawerOpen(true);
        cartStore.set((current) => {
          const existing = current.items.find((candidate) =>
            isSameLine(candidate, item.productId, item.pricingMode, item.variantId),
          );

          if (!existing) {
            return { ...current, items: [...current.items, item] };
          }

          return {
            ...current,
            items: current.items.map((candidate) =>
              isSameLine(candidate, item.productId, item.pricingMode, item.variantId)
                ? { ...candidate, quantity: candidate.quantity + item.quantity }
                : candidate,
            ),
          };
        });
      },
      removeItem: (productId, pricingMode, variantId) =>
        cartStore.set((current) => ({
          ...current,
          items: current.items.filter(
            (candidate) => !isSameLine(candidate, productId, pricingMode, variantId),
          ),
        })),
      updateQuantity: (productId, pricingMode, variantId, quantity) =>
        cartStore.set((current) => ({
          ...current,
          items: current.items
            .map((candidate) =>
              isSameLine(candidate, productId, pricingMode, variantId)
                ? { ...candidate, quantity }
                : candidate,
            )
            .filter((candidate) => candidate.quantity > 0),
        })),
      setShippingMethodId: (nextShippingMethodId) =>
        cartStore.set((current) => ({ ...current, shippingMethodId: nextShippingMethodId })),
      setDiscountCode: (nextDiscountCode) =>
        cartStore.set((current) => ({ ...current, discountCode: nextDiscountCode })),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      clearCart: () => cartStore.set(() => emptyCart),
    }),
    [discountCode, isDrawerOpen, items, shippingMethodId],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return context;
}
