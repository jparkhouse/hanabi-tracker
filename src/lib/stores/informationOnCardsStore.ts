// /lib/stores/informationOnCardsStore.ts

import { type GameConfig } from "./gameConfigStore";
import type { CardInformation } from "../models/card";
import { NumberEnum } from "../models/numberEnums";
import type { SuitEnum } from "../models/variantEnums";
import { createManagedStore } from "./persistentDataManagerStore";

const defaultData = (config: GameConfig) => {
  return {
    numberInformation: NumberEnum.All,
    knownNumberInformation: 0 as NumberEnum,
    colourInformation: config.variant,
    knownColourInformation: 0 as SuitEnum,
  } as CardInformation;
};

export const informationOnCardsStore = createManagedStore<CardInformation>(
  "cardInformation",
  defaultData
);
