// /lib/stores/cardsInHandStore.ts

import { createPersistentStore } from "./persistentStore";
import { gameConfigStore } from 
  
// Initialize the store with a default value, which will be replaced if information already stored
const cardsInHandStore = createPersistentStore<number[]>('cardsInHand', [1, 2, 3, 4]);

export default cardsInHandStore;