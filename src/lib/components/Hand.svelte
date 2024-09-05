<!-- /lib/components/Hand.svelte -->

<script lang="ts">
  import Card from "./Card.svelte";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import { notesOnCardsStore } from "../stores/notesOnCardsStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";
  import gameOrReviewStore from "../stores/gameOrReviewStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import type { CardInformation } from "../models/card";

  function handleCardSelect(cardId: number) {
    // Simple toggle selection logic
    if ($cardsSelectedStore.has(cardId)) {
      cardsSelectedStore.update((selected) => {
        const updated = new Set(selected);
        updated.delete(cardId);
        return updated;
      });
    } else {
      cardsSelectedStore.update((selected) => {
        const updated = new Set(selected);
        updated.add(cardId);
        return updated;
      });
    }
  }

  let reviewSet: boolean = false;
  let cards: number[] = [];
  let cardInformations: CardInformation[] = [];
  let cardsHinted: boolean[] = [];
  $: {
    if (!$gameOrReviewStore && !reviewSet) {
      //review and not yet set up
      cards = cardsInHandStore.get();
      cardInformations = cards.map((id) => informationOnCardsStore.get(id));
      cardsHinted = cards.map((id) => flagsOnCardsStore.get(id).isHinted);
      reviewSet = true;
    } else if ($gameOrReviewStore && reviewSet) {
      // return to game and clear out old review information
      cards = [];
      cardInformations = [];
      cardsHinted = [];
      reviewSet = false;
    }
  }
</script>

<div class="hand">
  {#if $gameOrReviewStore}
    {#each $cardsInHandStore as id}
      <Card
        {id}
        numberInformation={$informationOnCardsStore.get(id).numberInformation}
        knownNumberInformation={$informationOnCardsStore.get(id)
          .knownNumberInformation}
        colourInformation={$informationOnCardsStore.get(id).colourInformation}
        knownColourInformation={$informationOnCardsStore.get(id)
          .knownColourInformation}
        note={$notesOnCardsStore.get(id).note}
        selected={$cardsSelectedStore.has(id)}
        isHinted={$flagsOnCardsStore.get(id).isHinted}
        isChopMoved={$flagsOnCardsStore.get(id).isChopMoved}
        isFinessed={$flagsOnCardsStore.get(id).isFinessed}
        isCritical={$flagsOnCardsStore.get(id).isCritical}
        onSelect={handleCardSelect}
      />
    {/each}
  {:else}
    {#each Array.from({ length: gameConfigStore.get().numberOfCards }, (_, i) => i) as ind}
      <Card
        id={cards[ind]}
        numberInformation={cardInformations[ind].numberInformation}
        knownNumberInformation={cardInformations[ind].knownNumberInformation}
        colourInformation={cardInformations[ind].colourInformation}
        knownColourInformation={cardInformations[ind].knownColourInformation}
        note={$notesOnCardsStore.get(cards[ind]).note}
        selected={$cardsSelectedStore.has(cards[ind])}
        isHinted={cardsHinted[ind]}
        isChopMoved={$flagsOnCardsStore.get(cards[ind]).isChopMoved}
        isFinessed={$flagsOnCardsStore.get(cards[ind]).isFinessed}
        isCritical={$flagsOnCardsStore.get(cards[ind]).isCritical}
        onSelect={handleCardSelect}
      />
    {/each}
  {/if}
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
