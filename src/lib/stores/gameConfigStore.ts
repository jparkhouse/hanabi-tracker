// /lib/stores/gameConfigStore.ts
import { createPersistentStore } from "./persistentStore";
import { SuitEnum } from "../models/variantEnums";

// Define an interface for your game configuration
export interface GameConfig {
  numberOfCards: number;
  variant: SuitEnum; // uses the SuitEnums
}

// Initialize the store with a default value, adhering to the GameConfig interface
export const gameConfigStore = createPersistentStore<GameConfig>("gameConfig", {
  numberOfCards: 4,
  variant: 31 as number as SuitEnum,
});
