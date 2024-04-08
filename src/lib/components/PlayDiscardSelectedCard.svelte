<!-- /lib/components/PlayDiscardSelectedCard.svelte -->
<script lang="ts">
    import { cardsSelectedStore } from "../stores/cardsSelectedStore";
    import { cards } from "../stores/cardsStore";
    import { incrementAndGet } from "../stores/cardIDCounterStore";
    import gameConfig from "../stores/gameConfigStore";
    import { Numbers } from "../models/numberEnums";

    $: variant = $gameConfig.variant;

    function playDiscardSelectedCard() {
    if ($cardsSelectedStore.size === 1) {
      const selectedId = $cardsSelectedStore.values().next().value;
      
      cards.updateCards($cards => {
        // Logic to remove the selected card
        const updatedCards = $cards.filter(card => card.id !== selectedId);
        updatedCards.push(createDefaultCard(incrementAndGet()));
        return updatedCards;
      });

      $cardsSelectedStore.clear(); // Clear selection after action
    }
  }

  function createDefaultCard(id: number) {
    return {
      id: id,
      numberInformation: Numbers.All,
      colourInformation: $gameConfig.variant,
      isHinted: false,
      isChopMoved: false,
      isFinessed: false,
      isCritical: false,
    };
  }
</script>

<button on:click={playDiscardSelectedCard} disabled={$cardsSelectedStore.size !== 1}>Play/Discard</button>