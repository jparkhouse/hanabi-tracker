<!-- /lib/components/Hand.svelte -->

<script lang="ts">
  import Card from "./Card.svelte";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import { notesOnCardsStore } from "../stores/notesOnCardsStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

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
</script>

<div class="hand">
  {#each $cardsInHandStore as id}
    <Card
      {id}
      numberInformation={$informationOnCardsStore.get(id).possibleNumberInformation}
      knownNumberInformation={$informationOnCardsStore.get(id)
        .knownNumberInformation}
      colourInformation={$informationOnCardsStore.get(id).possibleColourInformation}
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
