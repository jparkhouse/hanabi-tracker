// /lib/stores/cardIdCounterStore.ts

import { get, writable } from 'svelte/store';
import { createPersistentStore } from './persistentStore';


// Initializes with 0, assuming id starts from 0 or adjust based on your starting point
const nextCardId = createPersistentStore<number>('nextCardID', 7, (config) => 0);

// Function to increment and get the next id
function incrementAndGet(): number{
  let currentId: number = get(nextCardId);
  nextCardId.set(currentId + 1);
  return currentId; // Returns the id before incrementing, suitable for current use
}

export { nextCardId, incrementAndGet };
