// /lib/stores/managedStore.ts
import { writable, get } from "svelte/store";
import { DataManager } from "../models/dataManager";
import { gameConfigStore, type GameConfig } from "./gameConfigStore";
import { resetGameStore } from "./resetGameStore";

// Creating a generic managed store that syncs with local storage
export function createManagedStore<T>(
  key: string,
  getDefaultData: (config: GameConfig) => T
) {
  const localKey = import.meta.env.BASE_URL + "/" + key;

  // Create a writable store
  let defaultData = getDefaultData(get(gameConfigStore));
  const dataManager = new DataManager<T>(defaultData);
  const store = writable(dataManager);

  function updateLocalStore() {
    localStorage.setItem(localKey, get(store).toJSON());
  }

  // Initialize with local storage if available
  const storedData = localStorage.getItem(localKey);
  console.log(storedData);
  if (storedData && storedData !== "undefined") {
    store.update((currentManager) => {
      console.log(JSON.parse(storedData))
      currentManager.fromJSON(storedData);
      return currentManager;
    });
  }
  let firstLoad = true;
  // Subscribe to gameConfig changes
  resetGameStore.subscribe((number) => {
    if (!firstLoad) {
      const defaultData = getDefaultData(get(gameConfigStore));
      store.set(new DataManager<T>(defaultData));
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
    get: (id: number) => {
      let currentManager = get(store);
      return currentManager.get(id);
    },
    reset: () => {
      const defaultData = getDefaultData(get(gameConfigStore));
      store.set(new DataManager<T>(defaultData));
      updateLocalStore();
    },
  };
}
