// /lib/stores/persistentStore.ts
import { writable } from 'svelte/store';

// Generic function to create a writable store that syncs with local storage
export function createPersistentStore<T>(key: string, startValue: T) {
  const storedValue = localStorage.getItem(key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;
  const store = writable<T>(initialValue);

  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return store;
}