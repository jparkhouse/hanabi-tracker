// /lib/stores/gameConfigStore.ts
import { createPersistentStore } from './persistentStore';
import { SuitEnum, Variant } from '../models/variantEnums';

// Define an interface for your game configuration
export interface GameConfig {
  numberOfCards: number;
  variant: SuitEnum; // uses the SuitEnums
}

// Initialize the store with a default value, adhering to the GameConfig interface
const gameConfigStore = createPersistentStore<GameConfig>('gameConfig', {
  numberOfCards: 4,
  variant: Variant.NoVariant as number as SuitEnum,
});

export default gameConfigStore;
