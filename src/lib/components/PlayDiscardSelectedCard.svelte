<!-- /lib/components/PlayDiscardSelectedCard.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { incrementAndGet } from "../stores/cardIDCounterStore";
  import { get } from "svelte/store";
  import type { PlayDiscard } from "../models/gameActions";
  import { actionStore } from "../stores/actionStore";

  function playDiscardSelectedCard() {
    if ($cardsSelectedStore.size === 1) {
      let action: PlayDiscard = {
        actionType: "PlayDiscard",
        id: 0
      }
      const selectedId = $cardsSelectedStore.values().next().value;
      const currentCards = Array.from(get(cardsInHandStore));
      const newCards = currentCards.filter((card) => card !== selectedId); //remove the old card
      newCards.push(incrementAndGet()); // add the new card
      cardsInHandStore.set(newCards); // update store
      action.id = selectedId;
      $cardsSelectedStore.clear(); // Clear selection after action
      actionStore.push(action); // store the action
    }
  }
</script>

<button
  on:click={playDiscardSelectedCard}
  disabled={$cardsSelectedStore.size !== 1}>Play/Discard</button
>
