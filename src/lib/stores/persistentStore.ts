// /lib/stores/persistentStore.ts
import { writable } from 'svelte/store';

// Generic function to create a writable store that syncs with local storage
export function createPersistentStore<T>(key: string, startValue: T) {
  const storedValue = localStorage.getItem(import.meta.env.BASE_URL + '/' + key);
  const initialValue = storedValue ? JSON.parse(storedValue) : startValue;
  const store = writable<T>(initialValue);

  store.subscribe((value) => {
    localStorage.setItem(import.meta.env.BASE_URL + '/' + key, JSON.stringify(value));
  });

  const get = () => {
    const currentValue = localStorage.getItem(import.meta.env.BASE_URL + '/' + key)
    return currentValue ? JSON.parse(localStorage.getItem(import.meta.env.BASE_URL + '/' + key) as string) : null;
  }

  return {store , get};
}