// /lib/stores/gameConfigStore.ts
import { writable } from 'svelte/store';
import { Variant } from '../models/variantEnums';

// Define an interface for your game configuration
export interface GameConfig {
  numberOfCards: number;
  variant: number; // You can also use a union type for known variants, e.g., 'standard' | 'rainbow'
}

// Initialize the store with a default value, adhering to the GameConfig interface
const gameConfig = writable<GameConfig>({
  numberOfCards: 4,
  variant: Variant.NoVariant,
});

export default gameConfig;
