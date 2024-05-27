<!-- /lib/components/Hand.svelte -->

<script lang="ts">
  import gameConfigStore from '../stores/gameConfigStore';
  import { cards } from '../stores/cardsStore';
  import Card from './Card.svelte'
  import { cardsSelectedStore } from '../stores/cardsSelectedStore';

  function handleCardSelect(cardId: number) {
    // Simple toggle selection logic
    if ($cardsSelectedStore.has(cardId)) {
      cardsSelectedStore.update(selected => {
        const updated = new Set(selected);
        updated.delete(cardId);
        return updated;
      });
    } else {
      cardsSelectedStore.update(selected => {
        const updated = new Set(selected);
        updated.add(cardId);
        return updated;
      });
    }
  };
</script>
  
<div class="hand">
  {#each $cards as card (card.id)}
    <Card
      id={card.id}
      numberInformation={card.numberInformation}
      colourInformation={card.colourInformation}
      note={card.note}
      selected={$cardsSelectedStore.has(card.id)}
      isHinted={card.isHinted}
      isChopMoved={card.isChopMoved}
      isFinessed={card.isFinessed}
      isCritical={card.isCritical}
      onSelect={handleCardSelect}
    />
  {/each}
</div>
  
  
  
<style>

  .hand {
    display: flex;
    flex: 1;
    place-items: center;
    justify-content: space-around; /* Distribute space around items */
    flex-wrap: wrap; /* Allow wrapping if needed */
    gap: 10px; /* Space between cards */
    width: 100%;
  }
  </style>
  
  