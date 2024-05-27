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

export interface CardInformation {
  // number
  numberInformation: NumberEnum;
  knownNumberInformation: NumberEnum;
  // then colour
  colourInformation: SuitEnum;
  knownColourInformation: SuitEnum;
}

export interface CardNote {
  note: string;
}

export interface CardFlags {
  isHinted: boolean;
  isFinessed: boolean;
  isChopMoved: boolean;
  isCritical: boolean;
}