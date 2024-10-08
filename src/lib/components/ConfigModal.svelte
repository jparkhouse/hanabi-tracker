<!-- /lib/components/ConfigModal.svelte -->
<script lang="ts">
  import type { GameConfig } from "../stores/gameConfigStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import { SuitEnum } from "../models/variantEnums";
  import { resetGameStore } from "../stores/resetGameStore";
  import { get } from "svelte/store";
  import { reversedStore } from "../stores/reversedStore";

  export let isOpen = false;
  interface ConfigOutput {
    numberOfCards: number;
    numberOfStandardSuits: number;
    blacks: boolean;
    rainbows: boolean;
  }

  let reversed = false;

  let tempConfig: ConfigOutput = {
    numberOfCards: 0,
    numberOfStandardSuits: 0,
    blacks: false,
    rainbows: false,
  };

  let loaded = false;
  let validConfig = false;

  function configOutputToGameConfig(input: ConfigOutput): GameConfig {
    const output: GameConfig = {
      numberOfCards: input.numberOfCards,
      variant:
        Math.pow(2, input.numberOfStandardSuits) -
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
    let i = 0;
    while (i <= 4) {
      if ((suits & (1 << i)) > 0) {
        output += 1;
      }
      i += 1;
    }
    return output;
  }

  // Subscribe to gameConfig to initialize tempConfig
  $: if (isOpen) {
    if (!loaded) {
      const gameConfig = get(gameConfigStore);
      tempConfig = gameConfigToConfigOutput(gameConfig);
      reversed = get(reversedStore);
      loaded = true;
    }

    if (
      tempConfig.numberOfStandardSuits === 0 &&
      !tempConfig.blacks &&
      !tempConfig.rainbows
    ) {
      validConfig = false;
    } else {
      validConfig = true;
    }
  }

  function saveAndClosePanel() {
    if (
      areGameConfigsEqual(
        get(gameConfigStore),
        configOutputToGameConfig(tempConfig)
      ) &&
      reversed == get(reversedStore)
    ) {
      // reset game state
      gameConfigStore.set(configOutputToGameConfig(tempConfig));
      resetGameStore.update((number) => {
        return number + 1;
      });
    } else if (
      areGameConfigsEqual(
        get(gameConfigStore),
        configOutputToGameConfig(tempConfig)
      ) &&
      reversed != get(reversedStore)
    ) {
      reversedStore.set(reversed);
    } else {
      // load new game config
      gameConfigStore.set(configOutputToGameConfig(tempConfig));
      resetGameStore.update((number) => {
        return number + 1;
      });
      reversed != get(reversedStore);
    }
    closePanel()
  }

  function closePanel() {
    isOpen = false;
    loaded = false;
  }

  // set button text correctly
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
      ) &&
      reversed == get(reversedStore)
    ) {
      updateButtonText = "Reset";
      cancelButtonText = "Close";
    } else if (
      areGameConfigsEqual(
        get(gameConfigStore),
        configOutputToGameConfig(tempConfig)
      ) &&
      reversed != get(reversedStore)
    ) {
      updateButtonText = "Save";
      cancelButtonText = "Cancel";
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
        <div class="cards">
          <label for="numberOfCards">Number of cards:</label>
          <select id="numberOfCards" bind:value={tempConfig.numberOfCards}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <label for="numberOfCards">Card order reversed: </label>
          <input type="checkbox" id="toggleOrder" bind:checked={reversed} />
        </div>
        <div>
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
            <option value={5}>5</option>
          </select>

          <p>Special suits</p>
          <label>
            Rainbows:
            <input type="checkbox" bind:checked={tempConfig.rainbows} />
          </label>
          <label>
            Blacks:
            <input type="checkbox" bind:checked={tempConfig.blacks} />
          </label>
        </div>
      </div>

      <!-- Additional configuration options here -->

      <button on:click={saveAndClosePanel} hidden={!validConfig}
        >{updateButtonText}</button
      >
      <button on:click={closePanel} hidden={!validConfig}
        >{cancelButtonText}</button
      >
      <button class="error-button" hidden={validConfig}>Invalid config</button>
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
    color: white;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .config-form {
    padding: 20px;
  }

  .error-button {
    background-color: chocolate;
  }
</style>
