// /lib/stores/persistentStore.ts
import { writable, get } from "svelte/store";
import { gameConfigStore } from "./gameConfigStore";
import { resetGameStore } from "./resetGameStore";

export function createPersistentStore<T>(
  key: string,
  startValue: T,
  getResetValue?: (config: any) => T
) {
  let base: string;
  let firstLoad = true;
  try {
    base = import.meta.env.BASE_URL;
  } catch (error) {
    console.log(error);
    base = "/dev";
  }

  function updateLocalStore() {
    localStorage.setItem(localKey, JSON.stringify(get(store)));
  }

  const localKey = base + "/" + key;
  const storedValue = localStorage.getItem(localKey);
  const initialValue =
    (storedValue !== "undefined" && storedValue)
      ? JSON.parse(storedValue as string) as T
      : startValue;
  const store = writable<T>(initialValue);

  if (getResetValue) {
    // if there is a reset value, then we reset the store on resetGameStore change
    resetGameStore.subscribe((number) => {
      if (!firstLoad) {
        const resetValue = getResetValue(get(gameConfigStore));
        store.set(resetValue);
        updateLocalStore();
      } else {
        firstLoad = false;
      }
    });
  }

  return {
    subscribe: store.subscribe,
    set: (value: T) => {
      store.set(value);
      updateLocalStore();
    },
    get: () => {
      const currentValue = localStorage.getItem(localKey);
      return currentValue ? JSON.parse(currentValue) : null;
    },
    reset: () => {
      if (getResetValue) {
        const resetValue = getResetValue(get(gameConfigStore));
        store.set(resetValue);
      } else {
        store.set(startValue);
      }
    },
  };
}
