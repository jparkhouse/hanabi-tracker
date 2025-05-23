<!-- /lib/components/GameControls.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { actionStore } from "../stores/actionStore";
  import gameOrReviewStore from "../stores/gameOrReviewStore";
  import { get } from "svelte/store";

  import PlayDiscardSelectedCard from "./PlayDiscardSelectedCard.svelte";
  import MoreActionsMenu from "./MoreActionsMenu.svelte";
  import ConfigModal from "./ConfigModal.svelte";
  import HintModal from "./HintModal.svelte";
  import type { GameAction } from "../models/gameActions";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { contextOnCardsStore } from "../stores/contextOnCardsStore";
  import type { WebAction } from "../models/webAction";
  import reviewTurnStore from "../stores/reviewTurnStore";
  import { nextCardId } from "../stores/cardIDCounterStore";

  let wakeLock: WakeLockSentinel | null = null;
  let wakeLockSupported = "wakeLock" in navigator;
  let wakeLockButtonText = "Wake Lock Off"; // Initial text

  async function toggleWakeLock() {
    if (!wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
          wakeLockButtonText = "Turn Wake Lock On"; // Update text when the lock is released
        });
        wakeLockButtonText = "Turn Wake Lock Off"; // Update text to reflect status
      } catch (err) {
        console.error(`Could not acquire wake lock: ${err}`);
      }
    } else {
      wakeLock.release();
      wakeLock = null;
      wakeLockButtonText = "Turn Wake Lock on"; // Update text when the lock is released
    }
  }

  let actionStoreSize = actionStore.size;

  let actions: WebAction[] = [
    { label: wakeLockButtonText, action: toggleWakeLock },
  ];
  $: {
    actions = [{ label: wakeLockButtonText, action: toggleWakeLock }];
  }

  let reviewLabel = "Review";
  $: {
    if ($gameOrReviewStore) {
      reviewLabel = "Review";
    } else {
      reviewLabel = "Exit Review";
    }
  }

  function toggleGameOrReview() {
    gameOrReviewStore.set(!get(gameOrReviewStore));
    reviewTurnStore.set($actionStoreSize);
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
      const actionToUndo = actionStore.pop() as GameAction;
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

            let cardContext = contextOnCardsStore.get(id);
            cardContext = {
              ...cardContext,
              isHinted: actionToUndo.previousHinted[index],
            };
            contextOnCardsStore.set(id, cardContext);
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

            let cardContext = contextOnCardsStore.get(id);
            cardContext = {
              ...cardContext,
              isHinted: actionToUndo.previousHinted[index],
            };
            contextOnCardsStore.set(id, cardContext);
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

          // remove one from the nextCardId store
          nextCardId.set(Math.max(...ids));
          break;
      }
    }
  }
</script>

<div class="game-controls">
  
  <div class="primary-actions">
    {#if $gameOrReviewStore}
    <button class="configure" on:click={openConfigModal}>⚙️</button>
    <PlayDiscardSelectedCard />
    <button
      class="hint-panel"
      on:click={openHintModal}
      disabled={$cardsSelectedStore.size < 1}>Record Hint</button
    >
    <button
      class="undo"
      on:click={handleRollback}
      disabled={$actionStoreSize < 1}
    >
      Undo
    </button>
    {:else}
    <button class="review-button" disabled={$reviewTurnStore <= 0} on:click={() => reviewTurnStore.set(get(reviewTurnStore) - 1)}>
      Previous
    </button>
    <button class="review-button" disabled={$reviewTurnStore >= $actionStoreSize} on:click={() => reviewTurnStore.set(get(reviewTurnStore) + 1)}>
      Next
    </button>
    {/if}
  </div>

  <div class="secondary-actions">
    <button on:click={toggleGameOrReview}>
      {reviewLabel}
    </button>
    <MoreActionsMenu {actions} />
  </div>
</div>

<ConfigModal bind:isOpen={isConfigModalOpen} />
<HintModal bind:isOpen={isHintModalOpen} />

<style>
  .game-controls {
    display: flex;
    justify-content: space-between; /* Ensures space between primary and secondary actions */
    padding: 5px;
    gap: 5px;
    width: 100%; /* Ensure it uses the full width */
    box-sizing: border-box;
  }

  .primary-actions {
    display: flex;
    gap: 5px; /* Space between buttons */
  }

  .secondary-actions {
    display: flex;
    align-items: center; /* Align items vertically in the center */
    margin-left: auto; /* Pushes secondary actions to the right */
    gap: 5px;
  }
  .configure {
    align-self: flex-start; /* Aligns the configure button at the start */
  }

  .hint-panel {
    align-self: flex-end; /* Aligns the hint panel button at the end */
  }
</style>
