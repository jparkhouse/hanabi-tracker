// /lib/models/card.ts

export interface Card {
    numberInformation: number; // updated type for bitfuckery
    colourInformation: number;
    id: number; // Unique identifier for each card
    isHinted: boolean;
    isFinessed: boolean;
    isChopMoved: boolean;
    isCritical: boolean;
  }