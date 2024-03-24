// /lib/stores/cardsSelectedStore.ts

import { writable } from 'svelte/store';

// Initialize the store with an empty Set
const cardsSelectedStore = writable<Set<number>>(new Set());

export { cardsSelectedStore };
