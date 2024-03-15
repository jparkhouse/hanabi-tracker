// /lib/models/card.ts
import { writable } from 'svelte/store';

export interface Card {
    numberInformation: (boolean | null)[];
    colourInformation: (boolean | null)[];
    id: number; // Unique identifier for each card
  }