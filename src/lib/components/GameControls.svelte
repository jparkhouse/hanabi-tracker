<!-- /lib/components/GameControls.svelte -->
<script lang=ts>
  import PlayDiscardSelectedCard from "./PlayDiscardSelectedCard.svelte";
  import ConfigModal from './ConfigModal.svelte';
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import HintModal from "./HintModal.svelte";
  import MarkModal from "./MarkModal.svelte";

  let isConfigModalOpen = false;
  
  function openConfigModal() {
    isConfigModalOpen = true;
  }

  let isHintModalOpen = false;

  function openHintModal() {
    isHintModalOpen = true;
  }

  let isMarkModalOpen = false;

  function openMarkModal() {
    isMarkModalOpen = true;
  }
</script>

<div class="game-controls">
  <button class="configure" on:click={openConfigModal}>Configure Game</button>
  <PlayDiscardSelectedCard />
  <button class="hint-panel" on:click={openHintModal} disabled={$cardsSelectedStore.size < 1}>Record Hint</button>
  <button class="mark-panel" on:click={openMarkModal} disabled={$cardsSelectedStore.size < 1}>Mark cards</button>
</div>
<ConfigModal bind:isOpen={isConfigModalOpen} />
<HintModal bind:isOpen={isHintModalOpen} />
<MarkModal bind:isOpen={isMarkModalOpen} />

<style>
  .game-controls {
      display: flex;
      flex: 1;
      padding: 5px;
      gap: 5px;
    }
  .configure {
    align-self: left;
  }
  .hint-panel {
    align-items: right;
  }
</style>