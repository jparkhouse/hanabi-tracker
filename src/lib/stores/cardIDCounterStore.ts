// /lib/stores/cardIdCounterStore.ts

import { writable } from 'svelte/store';

// Initializes with 0, assuming id starts from 0 or adjust based on your starting point
const nextCardId = writable<number>(0);

// Function to increment and get the next id
function incrementAndGet(): number{
  let currentId: number = 0;
  nextCardId.update(n => {
    currentId = n;
    return n + 1;
  });
  return currentId; // Returns the id before incrementing, suitable for current use
}

export { nextCardId, incrementAndGet };
