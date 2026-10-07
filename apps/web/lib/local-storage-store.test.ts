import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalStorageStore } from "./local-storage-store";

interface TestState {
  items: string[];
}

const storageKey = "test-store";

/**
 * The store only ever touches `window.localStorage` and `window` storage events,
 * so a small stub covers it without pulling a full DOM environment into the
 * default (fast) test environment.
 */
function createWindowStub() {
  const entries = new Map<string, string>();
  const listeners = new Set<(event: { key: string | null }) => void>();

  const windowStub = {
    localStorage: {
      get length() {
        return entries.size;
      },
      clear: () => entries.clear(),
      getItem: (key: string) => (entries.has(key) ? entries.get(key)! : null),
      key: (index: number) => Array.from(entries.keys())[index] ?? null,
      removeItem: (key: string) => entries.delete(key),
      setItem: (key: string, value: string) => {
        entries.set(key, String(value));
      },
    },
    addEventListener: (type: string, listener: (event: { key: string | null }) => void) => {
      if (type === "storage") {
        listeners.add(listener);
      }
    },
    removeEventListener: (type: string, listener: (event: { key: string | null }) => void) => {
      if (type === "storage") {
        listeners.delete(listener);
      }
    },
  };

  return {
    window: windowStub,
    emitStorageEvent: (key: string | null) => {
      listeners.forEach((listener) => listener({ key }));
    },
  };
}

function createStore() {
  return createLocalStorageStore<TestState>({
    storageKey,
    emptyValue: { items: [] },
    parse: (raw) => (raw ? (JSON.parse(raw) as TestState) : { items: [] }),
    stringify: (value) => JSON.stringify(value),
  });
}

let stub: ReturnType<typeof createWindowStub>;

beforeEach(() => {
  stub = createWindowStub();
  vi.stubGlobal("window", stub.window);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createLocalStorageStore", () => {
  it("keeps the snapshot referentially stable while storage is unchanged", () => {
    const store = createStore();

    // useSyncExternalStore re-renders whenever the snapshot identity changes,
    // so an unstable snapshot would cause an infinite render loop.
    expect(store.read()).toBe(store.read());
  });

  it("hydrates from a value already persisted in localStorage", () => {
    stub.window.localStorage.setItem(storageKey, JSON.stringify({ items: ["box-1"] }));

    expect(createStore().read()).toEqual({ items: ["box-1"] });
  });

  it("reads the empty value when nothing is persisted", () => {
    expect(createStore().read()).toEqual({ items: [] });
  });

  it("persists updates and hands back the new snapshot", () => {
    const store = createStore();

    store.set((current) => ({ ...current, items: [...current.items, "box-2"] }));

    expect(store.read()).toEqual({ items: ["box-2"] });
    expect(stub.window.localStorage.getItem(storageKey)).toBe(
      JSON.stringify({ items: ["box-2"] }),
    );
    expect(store.read()).toBe(store.read());
  });

  it("notifies subscribers on set", () => {
    const store = createStore();
    const listener = vi.fn();

    store.subscribe(listener);
    store.set(() => ({ items: ["box-3"] }));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("stops notifying after unsubscribe", () => {
    const store = createStore();
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set(() => ({ items: ["box-4"] }));

    expect(listener).not.toHaveBeenCalled();
  });

  it("re-reads when another tab writes to the same key", () => {
    const store = createStore();
    const listener = vi.fn();

    store.subscribe(listener);
    stub.window.localStorage.setItem(storageKey, JSON.stringify({ items: ["from-other-tab"] }));
    stub.emitStorageEvent(storageKey);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.read()).toEqual({ items: ["from-other-tab"] });
  });

  it("ignores storage events for unrelated keys", () => {
    const store = createStore();
    const listener = vi.fn();

    store.subscribe(listener);
    stub.emitStorageEvent("some-other-key");

    expect(listener).not.toHaveBeenCalled();
  });

  it("exposes the empty value as the server snapshot", () => {
    stub.window.localStorage.setItem(storageKey, JSON.stringify({ items: ["box-5"] }));

    const store = createStore();

    // The server has no storage access, so the first paint must be deterministic.
    expect(store.getServerSnapshot()).toEqual({ items: [] });
    expect(store.read()).toEqual({ items: ["box-5"] });
  });
});
