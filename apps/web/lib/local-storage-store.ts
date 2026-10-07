/**
 * A tiny localStorage-backed external store designed to be consumed through
 * React's `useSyncExternalStore`.
 *
 * Reading browser storage during an effect and pushing it into component state
 * triggers a second render pass and is flagged by the `react-hooks`
 * `set-state-in-effect` rule. `useSyncExternalStore` is the intended way to bind
 * React to an external store such as localStorage: it lets the server render a
 * deterministic snapshot and swaps in the browser value right after hydration,
 * without a render-triggering effect.
 *
 * `getSnapshot` must return a referentially stable value, so the deserialized
 * result is cached and only recomputed when the underlying raw string changes.
 */
export function createLocalStorageStore<T>({
  storageKey,
  emptyValue,
  parse,
  stringify,
}: {
  storageKey: string;
  emptyValue: T;
  parse: (raw: string | null) => T;
  stringify: (value: T) => string;
}) {
  const listeners = new Set<() => void>();

  let cacheValid = false;
  let cachedRaw: string | null = null;
  let cachedValue: T = emptyValue;

  function read(): T {
    const raw = window.localStorage.getItem(storageKey);

    if (!cacheValid || raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
      cacheValid = true;
    }

    return cachedValue;
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== storageKey) {
        return;
      }

      cacheValid = false;
      emit();
    };

    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function set(updater: (current: T) => T) {
    const serialized = stringify(updater(read()));

    window.localStorage.setItem(storageKey, serialized);
    cachedRaw = serialized;
    cachedValue = parse(serialized);
    cacheValid = true;
    emit();
  }

  function getServerSnapshot(): T {
    return emptyValue;
  }

  return { read, set, subscribe, getServerSnapshot };
}
