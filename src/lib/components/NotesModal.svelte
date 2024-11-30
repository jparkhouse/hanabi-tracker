<!-- /lib/components/NotesModal.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { contextOnCardsStore } from "../stores/contextOnCardsStore";

  export let isOpen = false;

  let noteField = "";

  function closePanel() {
    noteField = "";
    isOpen = false;
  }

  function appendNotes() {
    const selectedCardIds = Array.from($cardsSelectedStore);

    selectedCardIds.forEach((id) => {
      const oldCardContext = contextOnCardsStore.get(id);
      if (oldCardContext.note) {
        contextOnCardsStore.set(id, {
          ...oldCardContext,
          note: oldCardContext.note + " | " + noteField,
        });
      } else {
        contextOnCardsStore.set(id, {
          ...oldCardContext,
          note: noteField,
        });
      }
    });
    cardsSelectedStore.update((selected) => {
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }

  function clearNotes() {
    const selectedCardIds = Array.from($cardsSelectedStore);

    selectedCardIds.forEach((id) => {
      const oldCardContext = contextOnCardsStore.get(id);
      contextOnCardsStore.set(id, { 
        ...oldCardContext,
        note: "",
      });
    });
    cardsSelectedStore.update((selected) => {
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closePanel}>
    <div class="note-modal" on:click|stopPropagation>
      <input
        class="note-field"
        id="noteField"
        type="text"
        bind:value={noteField}
        placeholder="Its a..."
      />
      <div class="actions">
        <button on:click={appendNotes}>Append to notes</button>
        <button on:click={clearNotes}>Clear all</button>
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

  .note-modal {
    background-color: dimgray;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .note-field {
    box-sizing: border-box;
    border: 2px solid #cccccc; /* Light grey border */
    border-radius: 2px;
    padding: 10px;
    cursor: text;
    width: 90%;
    margin: 8px;
  }
</style>
