// /lib/models/actions.ts

import type { NumberEnum } from "./numberEnums";
import type { SuitEnum } from "./variantEnums";

export type GameAction = PlayDiscard | NumberHint | ColourHint;

export interface PlayDiscard {
  actionType: "PlayDiscard";
  id: number;
}

export interface NumberHint {
  actionType: "NumberHint";

  ids: number[];
  hintString: string;
  affectedIds: number[];

  previousHinted: boolean[];

  previousKnownNumberInformation: NumberEnum[];
  previousNumberInformation: NumberEnum[];
  newKnownNumberInformation: NumberEnum[];
  newNumberInformation: NumberEnum[];

  newHinted: boolean[];
}

export interface ColourHint {
  actionType: "ColourHint";

  ids: number[];
  hintString: string;
  affectedIds: number[];

  previousHinted: boolean[];

  previousKnownColourInformation: SuitEnum[];
  previousColourInformation: SuitEnum[];
  newKnownColourInformation: SuitEnum[];
  newColourInformation: SuitEnum[];

  newHinted: boolean[];
}
