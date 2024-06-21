// /lib/models/card.ts

import type { NumberEnum } from "./numberEnums";
import type { SuitEnum } from "./variantEnums";

/* 
no longer used - separated into individual concerns

export interface Card {
  numberInformation: NumberEnum; // updated type for bitfuckery
  colourInformation: SuitEnum;
  id: number; // Unique identifier for each card
  note: string;
  isHinted: boolean;
  isFinessed: boolean;
  isChopMoved: boolean;
  isCritical: boolean;
} */

export interface CardInformation {
  // possible starts with all and is narrowed down
  // known starts with none and is filled in with only directly hintable information
  // number
  possibleNumberInformation: NumberEnum;
  knownNumberInformation: NumberEnum;
  // then colour
  possibleColourInformation: SuitEnum;
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
