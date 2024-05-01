// /lib/models/card.ts

import type { NumberEnum } from "./numberEnums";
import type { SuitEnum } from "./variantEnums";

export interface Card {
    numberInformation: NumberEnum; // updated type for bitfuckery
    colourInformation: SuitEnum;
    id: number; // Unique identifier for each card
    note: string;
    isHinted: boolean;
    isFinessed: boolean;
    isChopMoved: boolean;
    isCritical: boolean;
  }