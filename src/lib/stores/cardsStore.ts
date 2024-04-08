// /lib/stores/cardsStore.ts
import { writable } from 'svelte/store';
import structuredClone from '@ungap/structured-clone';

import gameConfig from './gameConfigStore';
import type { GameConfig } from './gameConfigStore';
import type { Card as CardType } from '../models/card';
import { nextCardId, incrementAndGet } from '../stores/cardIDCounterStore';
import { cardsSelectedStore } from './cardsSelectedStore';
import { Stack } from '../models/stack';
import { Numbers } from '../models/numberEnums';

const storeHistory = new Stack<CardType[]>(5);

export const storeHistorySize = writable(0);

function createCardsStore() {

  const { subscribe, set, update } = writable<CardType[]>([]);
  
  const saveState = () => {
    update(currentCards => {
      storeHistory.push(structuredClone(currentCards));
      return currentCards;
    })
    storeHistorySize.set(storeHistory.size());
  }

  const rollback = () => {
    if (storeHistory.size() > 0) {
      const previousState = storeHistory.pop();
      storeHistorySize.set(storeHistory.size());
      if (previousState) {
        set(previousState);
      }
    } else {
      console.warn('No previous state available for rollback');
    }
    storeHistorySize.set(storeHistory.size());
  }

  const resetCards = (config: GameConfig) => {
    storeHistory.clear(); // if the config is changing then we cannot keep any previous state knowledge
    storeHistorySize.set(storeHistory.size());
    const newCards: CardType[] = Array.from({ length: config.numberOfCards }, (_, i) => ({
      id: incrementAndGet(),
      numberInformation: Numbers.All, // set all numbers to possible
      colourInformation: config.variant, // get all posible suits from variant
      isHinted: false,
      isChopMoved: false,
      isFinessed: false,
      isCritical: false,
    }));
    set(newCards);
  };

  // Subscribe to gameConfig and reset cards whenever it changes
  const unsubscribe = gameConfig.subscribe($gameConfig => {
    nextCardId.set(0);
    cardsSelectedStore.update(selected => {
      selected = new Set<number>();
      return selected;
    });
    resetCards($gameConfig);
  });

  // Ensure to clean up the subscription when the store is no longer needed
  // This might be handled differently depending on your app's architecture
  

  return {
    subscribe,
    updateCards: (updateFunction: (cards: CardType[]) => CardType[]) => {
      update(currentCards => {
        saveState();
        return updateFunction(currentCards);
      });
    },
    rollback,
    saveState,
    // Add a method for manual cleanup if necessary, depending on your app structure
    cleanup: () => unsubscribe(),
  };
}

export const cards = createCardsStore();
