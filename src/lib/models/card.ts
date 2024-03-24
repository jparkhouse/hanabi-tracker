// /lib/models/card.ts

export interface Card {
    numberInformation: (boolean | null)[];
    colourInformation: (boolean | null)[];
    id: number; // Unique identifier for each card
  }