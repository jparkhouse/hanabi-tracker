<!-- /lib/components/PlayDiscardSelectedCard.svelte -->
<script lang="ts">
    import { cardsSelectedStore } from "../stores/cardsSelectedStore";
    import { cards } from "../stores/cardsStore";
    import { incrementAndGet } from "../stores/cardIDCounterStore";

    function playDiscardSelectedCard() {
    if ($cardsSelectedStore.size === 1) {
      const selectedId = $cardsSelectedStore.values().next().value;
      
      cards.updateCards($cards => {
        // Logic to remove the selected card
        const updatedCards = $cards.filter(card => card.id !== selectedId);
        // Add a new card with default information at the end if needed
        // Example: Add logic based on game rules about when new cards are added
        updatedCards.push(createDefaultCard(incrementAndGet()));

        // This is a placeholder; you'll define createDefaultCard next
        return updatedCards;
      });

      $cardsSelectedStore.clear(); // Clear selection after action
    }
  }

  function createDefaultCard(id: number) {
    // Assuming a structure similar to what you have for initializing cards
    return {
      id: id,
      numberInformation: Array(5).fill(null),
      colourInformation: Array(
        // Use gameConfig for variant-specific length; this is a simplified example
        5 // Adjust based on your game's rules
      ).fill(null),
    };
  }
</script>

<button on:click={playDiscardSelectedCard} disabled={$cardsSelectedStore.size !== 1}>Play/Discard</button>