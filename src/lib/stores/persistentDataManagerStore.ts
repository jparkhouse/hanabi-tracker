// /lib/stores/managedStore.ts
import { writable } from 'svelte/store';
import { DataManager } from '../models/dataManager';

// Creating a generic managed store that syncs with local storage
export function createManagedStore<T>(key: string, defaultData: T) {
  const localKey = import.meta.env.BASE_URL + '/' + key;
  const storedData = localStorage.getItem(localKey);
  
  // Initialize DataManager with stored data or default data
  const dataManager = new DataManager<T>(defaultData);
  if (storedData) {
    dataManager.fromJSON(storedData);
  }
  
  // Create a Svelte writable store encapsulating the DataManager
  const store = writable<DataManager<T>>(dataManager);

  // Subscribe to changes in the store and update local storage accordingly
  store.subscribe((manager) => {
    localStorage.setItem(localKey, manager.toJSON());
  });

  // Enhancing the store with custom methods
  return {
    subscribe: store.subscribe,
    set: (id: number, data: T) => {
      store.update(currentManager => {
        currentManager.set(id, data);
        return currentManager;
      });
    },
    get: (id: number) => {
      return dataManager.get(id);
    },
    reset: () => {
      const newDataManager = new DataManager<T>(defaultData);
      store.set(newDataManager);
    }
  };
}
