<!-- /lib/components/ConfigModal.svelte -->
<script lang="ts">
  import type { GameConfig } from '../stores/gameConfigStore';
  import gameConfig from '../stores/gameConfigStore';

  export let isOpen = false;

  let tempConfig: GameConfig = { numberOfCards: 4, variant: 'no-variant' }; // Initialize with default or current values

  // Subscribe to gameConfig to initialize tempConfig
  $: if (isOpen) {
    tempConfig = $gameConfig;
  }

  function closePanel() {
    isOpen = false;
  }

  function saveConfig() {
    gameConfig.set(tempConfig);
    closePanel();
  }
  $: console.log(isOpen);
</script>

{#if isOpen}
<div class="modal-overlay">
  <div class="config-modal">
      <div class="config-form">
        <label for="numberOfCards">Number of Cards:</label>
        <select id="numberOfCards" bind:value={tempConfig.numberOfCards}>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <label for="Variant">Variant:</label>
        <select id="Variant" bind:value={tempConfig.variant}>
          <option value="no-variant">No variant</option>
          <option value="rainbows">Rainbows</option>
          <option value="blacks">Blacks</option>
        </select>
      </div>
      

      <!-- Additional configuration options here -->

      <button on:click={saveConfig}>Save</button>
      <button on:click={closePanel}>Cancel</button>
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

.config-modal {
  background-color: dimgray;
  padding: 20px;
  border-radius: 5px;
  border: 2px solid lightgray;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.config-form{
  padding: 20px;
}
</style>
