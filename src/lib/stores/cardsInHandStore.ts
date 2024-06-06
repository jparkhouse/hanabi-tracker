// /lib/stores/cardsInHandStore.ts

import { createPersistentStore } from "./persistentStore";
import { type GameConfig } from './gameConfigStore'
import { incrementAndGet } from "./cardIDCounterStore";

const defaultData = (config: GameConfig) => {
    const numbers: number[] = [];
    for (let i = 0; i < config.numberOfCards; i++) {
        numbers.push(incrementAndGet());
    }
    return numbers
}

// Initialize the store with a default value, which will be replaced if information already stored
export const cardsInHandStore = createPersistentStore<number[]>('cardsInHand', [0, 1, 2, 3], defaultData);