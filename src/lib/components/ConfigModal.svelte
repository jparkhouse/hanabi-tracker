<!-- /lib/components/ConfigModal.svelte -->
<script lang="ts">
  import type { GameConfig } from "../stores/gameConfigStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import { SuitEnum } from "../models/variantEnums";
  import { resetGameStore } from "../stores/resetGameStore";
  import { get } from "svelte/store";

  export let isOpen = false;
  interface ConfigOutput {
    numberOfCards: number;
    numberOfStandardSuits: number;
    blacks: boolean;
    rainbows: boolean;
  }

  let tempConfig: ConfigOutput = {
    numberOfCards: 0,
    numberOfStandardSuits: 0,
    blacks: false,
    rainbows: false,
  };
  let loaded = false;

  function configOutputToGameConfig(input: ConfigOutput): GameConfig {
    const output: GameConfig = {
      numberOfCards: input.numberOfCards,
      variant:
        (2 ^ input.numberOfStandardSuits) -
        1 +
        (input.rainbows ? SuitEnum.Rainbow : 0) +
        (input.blacks ? SuitEnum.Black : 0),
    };
    return output;
  }

  function gameConfigToConfigOutput(input: GameConfig): ConfigOutput {
    const output: ConfigOutput = {
      numberOfCards: input.numberOfCards,
      numberOfStandardSuits: getStandardSuitAmount(input.variant),
      blacks: (input.variant & SuitEnum.Black) > 0,
      rainbows: (input.variant & SuitEnum.Rainbow) > 0,
    };
    return output;
  }

  function getStandardSuitAmount(suits: SuitEnum): number {
    let output = 0;
    let i = 1;
    while (i <= 5) {
      if ((suits & (1 << i)) > 0) {
        output += 1;
      }
      i += 1;
    }
    return output;
  }
  // Subscribe to gameConfig to initialize tempConfig
  $: if (isOpen && !loaded) {
    tempConfig = gameConfigToConfigOutput(get(gameConfigStore));
    loaded = true;
  }

  function closePanel() {
    isOpen = false;
    loaded = false;
  }

  function saveConfig() {
    gameConfigStore.set(configOutputToGameConfig(tempConfig));
    resetGameStore.update((number) => {
      return number + 1;
    });
    closePanel();
  }

  function areGameConfigsEqual(
    config1: GameConfig,
    config2: GameConfig
  ): boolean {
    return (
      config1.numberOfCards === config2.numberOfCards &&
      config1.variant === config2.variant
    );
  }

  let updateButtonText = "Reset";
  let cancelButtonText = "Close";
  $: {
    if (
      areGameConfigsEqual(
        get(gameConfigStore),
        configOutputToGameConfig(tempConfig)
      )
    ) {
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
        <label for="numberOfCards">Number of Cards:</label>
        <select id="numberOfCards" bind:value={tempConfig.numberOfCards}>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <label for="StandardSuits">Number of standard suits</label>
        <select
          id="StandardSuits"
          bind:value={tempConfig.numberOfStandardSuits}
        >
          <option value={0}>0</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={4}>5</option>
        </select>
        <div>
          <p>Special suits</p>
          <label>
            <input type="checkbox" bind:checked={tempConfig.rainbows} />
            Rainbows
          </label>
          <label>
            <input type="checkbox" bind:checked={tempConfig.blacks} />
            Blacks
          </label>
        </div>
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
