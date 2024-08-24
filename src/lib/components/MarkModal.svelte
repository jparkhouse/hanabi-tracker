<!-- /lib/components/MarkModal.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

  export let isOpen = false;

  let flag: "critical" | "chop-move" | "finesse" | null = null;

  function closePanel() {
    flag = null;
    isOpen = false;
  }

  function saveFlags() {
    const selectedCardIds = Array.from($cardsSelectedStore);

    selectedCardIds.forEach((id) => {
      const oldCardFlags = flagsOnCardsStore.get(id);
      switch (flag) {
        case "critical":
          flagsOnCardsStore.set(id, {
            ...oldCardFlags,
            isCritical: !oldCardFlags.isCritical,
          })
          break;
        case "finesse":
          flagsOnCardsStore.set(id, {
            ...oldCardFlags,
            isFinessed: !oldCardFlags.isFinessed,
          })
          break;
        case "chop-move":
          flagsOnCardsStore.set(id, {
            ...oldCardFlags,
            isChopMoved: !oldCardFlags.isChopMoved,
          })
          break;
      }
    })
    cardsSelectedStore.update((selected) => {
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closePanel}>
    <div class="mark-modal" on:click|stopPropagation>
      <div class="flags">
        <button class="btn" on:click={() => (flag = "critical")}
          >Critical</button
        >
        <button class="btn" on:click={() => (flag = "chop-move")}
          >Chop moved</button
        >
        <button class="btn" on:click={() => (flag = "finesse")}>Finessed</button
        >
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
