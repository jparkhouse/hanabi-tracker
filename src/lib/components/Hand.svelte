<script lang="ts">
    import { onMount } from 'svelte';
    import { writable, derived } from 'svelte/store';
    import gameConfig from '../stores/gameConfigStore';
    import type { Card } from '../models/card';
  
    // Local store for the hand's cards
    const cards = writable<Card[]>([]);
  
    // Derived store to react to changes in the game configuration, particularly the number of cards
    const configuredCards = derived(gameConfig, $gameConfig => {
      const newCards: Card[] = [];
      for (let i = 0; i < $gameConfig.numberOfCards; i++) {
        newCards.push({
            id: i,
            numberInformation: Array(5).fill(null),
            colourInformation: Array($gameConfig.variant === 'no-variant' ? 5 : $gameConfig.variant === 'rainbows' || $gameConfig.variant === 'blacks' ? 6 : 7).fill(null),
      });
      }
      cards.set(newCards);
    });

    function getColourCode(colourInfo: (boolean | null)[]) {
        const colours = ['r', 'y', 'b', 'w', 'g', 'm', 'bl']; // Colour codes
        return colours
            .filter((_, index) => colourInfo[index] === true)
            .join(', ');
    };
  </script>
  
  <div class="hand">
    {#each $cards as card (card.id)}
      <div class="card">
        <div>Card {card.id + 1}</div>
        <div>Numbers: 
          {#each card.numberInformation as info, index}
            {#if info === true}{index + 1}{:else if info === false}!{index + 1}{/if}
          {/each}
        </div>
        <div>Colours: 
          {getColourCode(card.colourInformation)}
        </div>
      </div>
    {/each}
  </div>
  
  
  
  <style>
    .hand {
      display: flex;
      padding: 10px;
      gap: 10px;
    }
    .card {
      width: 120px; /* Adjusted width */
      height: 150px; /* Adjusted height */
      background-color: lightgray;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      padding: 10px; /* Added padding */
    }
  </style>
  
  