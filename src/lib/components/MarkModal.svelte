<!-- /lib/components/MarkModal.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

  export let isOpen = false;

  function closePanel() {
    isOpen = false;
    cardsSelectedStore.set(new Set<number>);
  }

  function toggleFinessed() {
    const cards = Array.from($cardsSelectedStore);
    const cardsFinessedFlags: boolean[] = cards.map((id) => {
      return flagsOnCardsStore.get(id).isFinessed;
    });
    if (cardsFinessedFlags.every((i) => {return i})) {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isFinessed: false})
      })
    } else {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isFinessed: true})
      })
    }
    closePanel()
  }

  function toggleChopMoved() {
    const cards = Array.from($cardsSelectedStore);
    const cardsChopMovedFlags: boolean[] = cards.map((id) => {
      return flagsOnCardsStore.get(id).isChopMoved;
    });
    if (cardsChopMovedFlags.every((i) => {return i})) {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isChopMoved: false})
      })
    } else {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isChopMoved: true})
      })
    }
    closePanel()
  }

  function toggleCritical() {
    const cards = Array.from($cardsSelectedStore);
    const cardsCriticalFlags: boolean[] = cards.map((id) => {
      return flagsOnCardsStore.get(id).isCritical;
    });
    if (cardsCriticalFlags.every((i) => {return i})) {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isCritical: false})
      })
    } else {
      cards.forEach((id) => {
        const cardFlags = flagsOnCardsStore.get(id);
        flagsOnCardsStore.set(id, {...cardFlags, isCritical: true})
      })
    }
    closePanel()
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closePanel}>
    <div class="mark-modal" on:click|stopPropagation>
      <div class="flags">
        <button class="btn" on:click={toggleCritical}
          >Critical</button
        >
        <button class="btn" on:click={toggleChopMoved}
          >Chop moved</button
        >
        <button class="btn" on:click={toggleFinessed}>Finessed</button
        >
      </div>
      <div class="actions">
        <button on:click={closePanel}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flags {
    padding: 20px;
  }

  .mark-modal {
    background-color: dimgray;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
</style>
