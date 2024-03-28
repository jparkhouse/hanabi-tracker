<!-- /lib/components/ConfigModal.svelte -->
<script lang="ts">
  import { cards } from "../stores/cardsStore";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  
  export let isOpen = false;

  let flag: 'critical' | 'chop-move' | 'finesse' | null = null;
  
  $: localCards = $cards
  
  function closePanel() {
    flag = null;
    isOpen = false;
  }
  
  function saveFlags() {
    const selectedCardIds = Array.from($cardsSelectedStore);

    localCards.map(card => {
      if (selectedCardIds.includes(card.id)) {
        switch (flag) {
          case 'critical':
            card.isCritical = !card.isCritical;
            break;
          case 'chop-move':
            card.isChopMoved = !card.isChopMoved;
            break;
          case 'finesse':
            card.isFinessed = !card.isFinessed;
            break;
        }
      }
      return card
    });
    cards.updateCards(localCards => {
      return localCards;
    });
    cardsSelectedStore.update(selected => {
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }
    
</script>
  

{#if isOpen}
<div class="modal-overlay">
  <div class="mark-modal">
    <div class="flags">
      <button class="btn" on:click={() => flag = 'critical'}>Critical</button>
      <button class="btn" on:click={() => flag = 'chop-move'}>Chop moved</button>
      <button class="btn" on:click={() => flag = 'finesse'}>Finessed</button>
    </div>
    <div class="actions">
      <button on:click={saveFlags} disabled={!flag}>Save</button>
      <button on:click={closePanel}>Cancel</button>
    </div>
  </div>
</div>
{/if}
  
<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .mark-modal {
    background-color: dimgray;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }
</style>
  