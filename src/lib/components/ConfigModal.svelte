<!-- /lib/components/ConfigModal.svelte -->
<script lang="ts">
  import type { GameConfig } from "../stores/gameConfigStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import { SuitEnum, Variant } from "../models/variantEnums";
  import { createEventDispatcher } from "svelte";
  import { resetGameStore } from "../stores/resetGameStore";

  export let isOpen = false;

  let tempConfig: GameConfig = { numberOfCards: 4, variant: SuitEnum.Red, drawDirection: "Right" }; // Initialize with default or current values
  let get = false;

  // Subscribe to gameConfig to initialize tempConfig
  $: if (isOpen && !get) {
    tempConfig = { ...$gameConfigStore };
    get = true;
  }

  const resetDispatcher = createEventDispatcher();



  function closePanel() {
    isOpen = false;
    get = false;
  }

  function saveConfig() {
    gameConfigStore.set(tempConfig);
    resetGameStore.update((number) => {return number + 1})
    closePanel();
  }

  function areGameConfigsEqual(
    config1: GameConfig,
    config2: GameConfig
  ): boolean {
    return (
      config1.numberOfCards === config2.numberOfCards &&
      config1.variant === config2.variant &&
      config1.drawDirection === config2.drawDirection
    );
  }

  let updateButtonText = "Reset";
  let cancelButtonText = "Close";
  $: {
    if (areGameConfigsEqual($gameConfigStore, tempConfig)) {
      updateButtonText = "Reset";
      cancelButtonText = "Close";
    } else {
      updateButtonText = "Update";
      cancelButtonText = "Cancel";
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closePanel}>
    <div class="config-modal" on:click|stopPropagation>
      <div class="config-form">
        <label for="drawDirection">Draw Direction:</label>
        <select id="drawDirection" bind:value={tempConfig.drawDirection}>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
        </select>
        <label for="numberOfCards">Number of Cards:</label>
        <select id="numberOfCards" bind:value={tempConfig.numberOfCards}>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <label for="Variant">Variant:</label>
        <select id="Variant" bind:value={tempConfig.variant}>
          <option value={Variant.NoVariant}>No variant</option>
          <option value={Variant.Rainbows}>Rainbows</option>
          <option value={Variant.Blacks}>Blacks</option>
          <option value={Variant.RainbowsAndBlacks}>Rainbows and Blacks</option>
        </select>
      </div>

      <!-- Additional configuration options here -->

      <button on:click={saveConfig}>{updateButtonText}</button>
      <button on:click={closePanel}>{cancelButtonText}</button>
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

  .config-modal {
    background-color: dimgray;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .config-form {
    padding: 20px;
  }
</style>
