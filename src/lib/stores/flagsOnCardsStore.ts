// /lib/stores/flagsOnCardsStore.ts

import { createManagedStore } from "./persistentDataManagerStore";
import { type CardFlags } from "../models/card";

const defaultValue:CardFlags =  {
    isHinted: false,
    isChopMoved: false,
    isCritical: false,
    isFinessed: false,
}

const flagsOnCardsStore = createManagedStore<CardFlags>('cardFlags', defaultValue);

export default flagsOnCardsStore;