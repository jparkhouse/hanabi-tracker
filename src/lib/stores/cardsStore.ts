// /lib/stores/cardsStore.ts
import { writable } from 'svelte/store';
import gameConfig from './gameConfigStore';
import type { GameConfig } from './gameConfigStore';
import type { Card as CardType } from '../models/card';
import { nextCardId, incrementAndGet } from '../stores/cardIDCounterStore';
import { cardsSelectedStore } from './cardsSelectedStore';
import { Stack } from '../models/stack';
import { deepCopy } from '../shared/deepCopy';

function createCardsStore() {

  const { subscribe, set, update, value } = writable<CardType[]>([]);
  const storeHistory = new Stack<CardType[]>(5);

  const resetCards = (config: GameConfig) => {
    storeHistory.push(this.map((value) => {
      return deepCopy(value);
    }))
    const newCards: CardType[] = Array.from({ length: config.numberOfCards }, (_, i) => ({
      id: incrementAndGet(),
      numberInformation: Array(5).fill(null),
      colourInformation: Array(
        config.variant === 'no-variant' ? 5 : config.variant === 'rainbows' || config.variant === 'blacks' ? 6 : 7
      ).fill(null),
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
        storeHistory.push(currentCards.map((value) => {
          return deepCopy(value); //take a copy of the cards for the stack
        }))
        return updateFunction(currentCards);
      });
    },
    // Add a method for manual cleanup if necessary, depending on your app structure
    cleanup: () => unsubscribe(),
    rollback: (rollbackFunction: () => {
      update(currentCards => {

      })
    })
  };
}

export const cards = createCardsStore();

