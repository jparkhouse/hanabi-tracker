// /lib/stores/gameConfigStore.ts
import { createPersistentStore } from "./persistentStore";
import { SuitEnum, Variant } from "../models/variantEnums";

// Define an interface for your game configuration
export interface GameConfig {
  numberOfCards: number;
  variant: SuitEnum; // uses the SuitEnums
  drawDirection: "Left" | "Right";
}

// Initialize the store with a default value, adhering to the GameConfig interface
export const gameConfigStore = createPersistentStore<GameConfig>("gameConfig", {
  numberOfCards: 4,
  variant: Variant.NoVariant as number as SuitEnum,
  drawDirection: "Right",
});
