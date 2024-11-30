// /lib/stores/flagsOnCardsStore.ts

import { createManagedStore } from "./persistentDictionaryStore";
import { type CardContext } from "../models/card";
import type { GameConfig } from "./gameConfigStore";

const defaultValue = (_config: GameConfig) => {
    return {
        note: "",
        isHinted: false,
        isChopMoved: false,
        isCritical: false,
        isFinessed: false,
    }
}

export const contextOnCardsStore = createManagedStore<CardContext>('cardContext', defaultValue);