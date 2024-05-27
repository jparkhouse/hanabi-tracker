// /lib/stores/notesOnCardsStore.ts

import { createManagedStore } from "./persistentDataManagerStore";
import { type CardNote } from "../models/card";
import type { GameConfig } from "./gameConfigStore";

const defaultValue = (config: GameConfig) => {
  return {
    note: "",
  };
};

export const notesOnCardsStore = createManagedStore<CardNote>(
  "cardNotes",
  defaultValue
);
