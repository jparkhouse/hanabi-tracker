<!-- /lib/components/GameControls.svelte -->
<script lang=ts>
  import PlayDiscardSelectedCard from "./PlayDiscardSelectedCard.svelte";
  import ConfigModal from './ConfigModal.svelte';
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cards, storeHistorySize } from "../stores/cardsStore";
  import HintModal from "./HintModal.svelte";
  import MarkModal from "./MarkModal.svelte";

  let wakeLock: WakeLockSentinel | null = null;
  let wakeLockSupported = 'wakeLock' in navigator;
  let wakeLockButtonText = 'Wake Lock Off'; // Initial text

  async function toggleWakeLock() {
    if (!wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
          wakeLockButtonText = 'Wake Lock Off'; // Update text when the lock is released
        });
        wakeLockButtonText = 'Wake Lock On'; // Update text to reflect status
      } catch (err) {
        console.error(`Could not acquire wake lock: ${err}`);
      }
    } else {
      wakeLock.release();
      wakeLock = null;
      wakeLockButtonText = 'Wake Lock Off'; // Update text when the lock is released
    }
  }

  // Reactive statement to update the button text based on the wakeLock status
  $: if (wakeLock) {
    wakeLockButtonText = 'Wake Lock On';
  } else {
    wakeLockButtonText = 'Wake Lock Off';
  }
  
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

  $: historySize = $storeHistorySize;

  function handleRollback() {
    cards.rollback()
  }
</script>

<div class="game-controls">
  <button class="configure" on:click={openConfigModal}>Configure Game</button>
  <button class="wake-lock" on:click={toggleWakeLock} hidden={!wakeLockSupported}>{wakeLockButtonText}</button>
  <PlayDiscardSelectedCard />
  <button class="hint-panel" on:click={openHintModal} disabled={$cardsSelectedStore.size < 1}>Record Hint</button>
  <button class="mark-panel" on:click={openMarkModal} disabled={$cardsSelectedStore.size < 1}>Mark Cards</button>
  <button class="undo" on:click={handleRollback} disabled={historySize < 1}>Undo</button>
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