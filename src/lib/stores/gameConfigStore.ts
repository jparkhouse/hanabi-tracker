// /lib/stores/gameConfigStore.ts
import { writable } from 'svelte/store';

// Define an interface for your game configuration
export interface GameConfig {
  numberOfCards: number;
  variant: 'no-variant' | 'rainbows' | 'blacks' |'rainbows-and-blacks'; // You can also use a union type for known variants, e.g., 'standard' | 'rainbow'
}

// Initialize the store with a default value, adhering to the GameConfig interface
const gameConfig = writable<GameConfig>({
  numberOfCards: 4,
  variant: 'no-variant',
});

export default gameConfig;
