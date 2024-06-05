<!-- /lib/components/GameControls.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { actionStore } from "../stores/actionsStore";

  import PlayDiscardSelectedCard from "./PlayDiscardSelectedCard.svelte";
  import ConfigModal from "./ConfigModal.svelte";
  import HintModal from "./HintModal.svelte";
  import type { Action } from "../models/actions";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import type { CardInformation } from "../models/card";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { get } from "svelte/store";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

  let wakeLock: WakeLockSentinel | null = null;
  let wakeLockSupported = "wakeLock" in navigator;
  let wakeLockButtonText = "Wake Lock Off"; // Initial text

  async function toggleWakeLock() {
    if (!wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
          wakeLockButtonText = "Wake Lock Off"; // Update text when the lock is released
        });
        wakeLockButtonText = "Wake Lock On"; // Update text to reflect status
      } catch (err) {
        console.error(`Could not acquire wake lock: ${err}`);
      }
    } else {
      wakeLock.release();
      wakeLock = null;
      wakeLockButtonText = "Wake Lock Off"; // Update text when the lock is released
    }
  }

  let actionStoreSize = actionStore.size;

  // Reactive statement to update the button text based on the wakeLock status
  $: if (wakeLock) {
    wakeLockButtonText = "Wake Lock On";
  } else {
    wakeLockButtonText = "Wake Lock Off";
  }

  let isConfigModalOpen = false;

  function openConfigModal() {
    isConfigModalOpen = true;
  }

  let isHintModalOpen = false;

  function openHintModal() {
    isHintModalOpen = true;
  }

  function handleRollback() {
    if ($actionStoreSize > 0) {
      const actionToUndo: Action = $actionStore.pop() as Action;
      switch (actionToUndo.actionType) {
        case "ColourHint": // undo a colour hint
          actionToUndo.ids.forEach((id, index) => {
            let cardInformation = informationOnCardsStore.get(id);
            cardInformation = {
              ...cardInformation,
              colourInformation: actionToUndo.previousColourInformation[index],
              knownColourInformation:
                actionToUndo.previousKnownColourInformation[index],
            };
            informationOnCardsStore.set(id, cardInformation);

            let cardFlags = flagsOnCardsStore.get(id);
            cardFlags = {
              ...cardFlags,
              isHinted: actionToUndo.previousHinted[index],
            };
            flagsOnCardsStore.set(id, cardFlags);
          });
          break;
        case "NumberHint": // undo a number hint
          actionToUndo.ids.forEach((id, index) => {
            let cardInformation = informationOnCardsStore.get(id);
            cardInformation = {
              ...cardInformation,
              numberInformation: actionToUndo.previousNumberInformation[index],
              knownNumberInformation:
                actionToUndo.previousKnownNumberInformation[index],
            };
            informationOnCardsStore.set(id, cardInformation);

            let cardFlags = flagsOnCardsStore.get(id);
            cardFlags = {
              ...cardFlags,
              isHinted: actionToUndo.previousHinted[index],
            };
            flagsOnCardsStore.set(id, cardFlags);
          });
          break;
        case "PlayDiscard": // undo a play/discard
          let ids = get(cardsInHandStore);

          // Create a new array and insert the actionToUndo.id in the correct position
          let previousIds = ids.filter((id) => id < actionToUndo.id);
          previousIds.push(actionToUndo.id);
          previousIds = previousIds.concat(
            ids.filter((id) => id > actionToUndo.id)
          );

          // Ensure the list stays the same length by removing the highest id
          if (previousIds.length > ids.length) {
            previousIds.pop();
          }

          cardsInHandStore.set(previousIds);
          break;
      }
    }
  }

  $: console.log($actionStoreSize);
</script>

<div class="game-controls">
  <button class="configure" on:click={openConfigModal}>Configure Game</button>
  <button
    class="wake-lock"
    on:click={toggleWakeLock}
    hidden={!wakeLockSupported}>{wakeLockButtonText}</button
  >
  <PlayDiscardSelectedCard />
  <button
    class="hint-panel"
    on:click={openHintModal}
    disabled={$cardsSelectedStore.size < 1}>Record Hint</button
  >
  <button class="undo" on:click={handleRollback} disabled={$actionStoreSize < 1}
    >Undo</button
  >
</div>
<ConfigModal bind:isOpen={isConfigModalOpen} />
<HintModal bind:isOpen={isHintModalOpen} />

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
