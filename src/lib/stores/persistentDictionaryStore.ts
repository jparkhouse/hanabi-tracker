// /lib/stores/managedStore.ts
import { writable, get } from "svelte/store";
import { Dictionary } from "../models/dictionary";
import { gameConfigStore, type GameConfig } from "./gameConfigStore";

// Creating a generic managed store that syncs with local storage
export function createManagedStore<T>(
  key: string,
  getDefaultData: (config: GameConfig) => T
) {
  const localKey = import.meta.env.BASE_URL + "/" + key;

  // Create a writable store
  let defaultData = getDefaultData(get(gameConfigStore));
  const dictionary = new Dictionary<T>(defaultData);
  const store = writable(dictionary);

  function updateLocalStore() {
    localStorage.setItem(localKey, get(store).toJSON());
  }

  // Initialize with local storage if available
  const storedData = localStorage.getItem(localKey);
  if (storedData && storedData !== "undefined") {
    store.update((currentManager) => {
      currentManager.fromJSON(storedData);
      return currentManager;
    });
  }
  let firstLoad = true;
  // Subscribe to gameConfig changes
  gameConfigStore.subscribe(() => {
    if (!firstLoad) {
      const defaultData = getDefaultData(get(gameConfigStore));
      store.set(new Dictionary<T>(defaultData));
      updateLocalStore();
    } else {
      firstLoad = false;
    }
  });

  // Enhance store with custom methods and handle local storage updates
  return {
    subscribe: store.subscribe,
    set: (id: number, data: T) => {
      store.update((currentManager) => {
        currentManager.set(id, data);
        return currentManager;
      });
      updateLocalStore();
    },
    get: (id: number): T => {
      let currentManager = get(store);
      return currentManager.getValueOrDefault(id);
    },
    reset: () => {
      const defaultData = getDefaultData(get(gameConfigStore));
      store.set(new Dictionary<T>(defaultData));
      updateLocalStore();
    },
  };
}
