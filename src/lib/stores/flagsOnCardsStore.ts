// /lib/stores/flagsOnCardsStore.ts

import { createManagedStore } from "./persistentDataManagerStore";
import { type CardFlags } from "../models/card";
import type { GameConfig } from "./gameConfigStore";

const defaultValue = (config: GameConfig) => {
    return {
        isHinted: false,
        isChopMoved: false,
        isCritical: false,
        isFinessed: false,
    }
}

export const flagsOnCardsStore = createManagedStore<CardFlags>('cardFlags', defaultValue);