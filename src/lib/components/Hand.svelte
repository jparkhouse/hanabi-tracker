<!-- /lib/components/Hand.svelte -->

<script lang="ts">
  import { Toaster, toast } from "svelte-french-toast";

  import Card from "./Card.svelte";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import { notesOnCardsStore } from "../stores/notesOnCardsStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";
  import gameOrReviewStore from "../stores/gameOrReviewStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import type { CardInformation } from "../models/card";
  import reviewTurnStore from "../stores/reviewTurnStore";
  import { get } from "svelte/store";
  import { actionStore } from "../stores/actionStore";
  import type { GameAction } from "../models/gameActions";
  import { NumberEnum } from "../models/numberEnums";
  import type { SuitEnum } from "../models/variantEnums";
  import { reversedStore } from "../stores/reversedStore";

  function handleCardSelect(cardId: number) {
    // Simple toggle selection logic
    if ($cardsSelectedStore.has(cardId)) {
      cardsSelectedStore.update((selected) => {
        const updated = new Set(selected);
        updated.delete(cardId);
        return updated;
      });
    } else {
      cardsSelectedStore.update((selected) => {
        const updated = new Set(selected);
        updated.add(cardId);
        return updated;
      });
    }
  }

  function getActionsFromActionStore(): GameAction[] {
    return get(actionStore).get();
  }

  /// helper function to extract values based on card conditions
  function extractValues<T>(
    cards: number[],
    values: T[],
    condition: (id: number) => boolean
  ): T[] {
    return cards
      .map((id, ind) => (condition(id) ? values[ind] : null))
      .filter((val) => val !== null) as T[];
  }

  $: localCardsInHandIds = $reversedStore
    ? [...$cardsInHandStore].reverse()
    : [...$cardsInHandStore];
  $: indexesForReview = $reversedStore
    ? cards.map((_, ind) => ind).reverse()
    : cards.map((_, ind) => ind);

  let reviewSet: boolean = false;
  let cards: number[] = [];
  let cardInformations: CardInformation[] = [];
  let cardsHinted: boolean[] = [];
  let localReviewTurn: number = 0;
  let localActionStore: GameAction[] = [];
  $: {
    if (!$gameOrReviewStore && !reviewSet) {
      // review and not yet set up
      // populate local cards in hand information
      cards = cardsInHandStore.get();
      cardInformations = cards.map((id) => informationOnCardsStore.get(id));
      cardsHinted = cards.map((id) => flagsOnCardsStore.get(id).isHinted);
      // populate local copies of game state
      localReviewTurn = get(reviewTurnStore);
      localActionStore = getActionsFromActionStore();
      // and set loaded state
      reviewSet = true;
    } else if ($gameOrReviewStore && reviewSet) {
      // return to game and clear out old review information
      cards = [];
      cardInformations = [];
      cardsHinted = [];
      localReviewTurn = 0;
      localActionStore = [];
      // and reset loaded state
      reviewSet = false;
    }
  }

  function describeAction(action: GameAction): string {
    if (action.actionType == "PlayDiscard") {
      return `PlayDiscard card ${action.id}`;
    } else {
      let len = action.affectedIds.length;
      let len_string =
        len === 1
          ? "one"
          : len === 2
            ? "two"
            : len === 3
              ? "three"
              : len === 4
                ? "four"
                : "hmmmm";
      let plural = len > 1 ? "s" : "";
      if (len === cardsInHandStore.get().length) {
        return `all these ${action.hintString.toLowerCase()}${plural}`;
      }
      return `${len_string} ${action.hintString.toLowerCase()}${plural}`;
    }
  }

  function addToast(action: GameAction, prefix?: string) {
    const description = (prefix ? prefix + " " : "") + describeAction(action);
    toast(description, {
      duration: 3000,
      position: "bottom-center",
      style: `
		border-radius: 8px;
		padding: 16px;
		color: var(--toast-text-color);
		background-color: var(--toast-background-color);
		border: 1px solid var(--toast-border-color);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	`,
      iconTheme: {
        primary: "var(--toast-icon-primary)",
        secondary: "var(--toast-icon-secondary)",
      },
    });
  }

  $: {
    if (localReviewTurn !== $reviewTurnStore && !$gameOrReviewStore) {
      if (localReviewTurn < $reviewTurnStore) {
        // we are moving forwards, and need to apply an action
        const actionToProgress = localActionStore[get(reviewTurnStore) - 1];

        switch (actionToProgress.actionType) {
          case "PlayDiscard":
            addToast(actionToProgress);

            const oldCardIndex = cards.findIndex(
              (id) => id === actionToProgress.id
            );

            if (oldCardIndex === -1) {
              throw new Error(
                "Card PlayDiscarded does not exist in local review information"
              );
            } else {
              // Create updated `cards` by filtering out the old card and adding the new one
              const newCards = [
                ...cards.filter((_, ind) => ind !== oldCardIndex),
                Math.max(...cards) + 1,
              ];

              // Create updated `cardInformations` by filtering out the old info and adding new info
              const newCardInformations = [
                ...cardInformations.filter((_, ind) => ind !== oldCardIndex),
                {
                  numberInformation: NumberEnum.All,
                  knownNumberInformation: 0 as NumberEnum,
                  colourInformation: get(gameConfigStore).variant,
                  knownColourInformation: 0 as SuitEnum,
                },
              ];

              // Create updated `cardsHinted` by filtering out the old hint status and adding `false`
              const newCardsHinted = [
                ...cardsHinted.filter((_, ind) => ind !== oldCardIndex),
                false,
              ];

              // update with new information
              cards = newCards;
              cardInformations = newCardInformations;
              cardsHinted = newCardsHinted;
            }
            break;
          case "NumberHint":
            addToast(actionToProgress, "Learned about");
            const newCardNumberInformations = cardInformations.map(
              (cardInfo, ind): CardInformation => ({
                ...cardInfo,
                numberInformation: actionToProgress.newNumberInformation[ind],
                knownNumberInformation:
                  actionToProgress.newKnownNumberInformation[ind],
              })
            );

            const newCardsNumberHinted = cardsHinted.map(
              (_, ind) => actionToProgress.newHinted[ind]
            );

            cardInformations = newCardNumberInformations;
            cardsHinted = newCardsNumberHinted;
            break;
          case "ColourHint":
            addToast(actionToProgress, "Learned about");
            const newCardColourInformations = cardInformations.map(
              (cardInfo, ind): CardInformation => ({
                ...cardInfo,
                colourInformation: actionToProgress.newColourInformation[ind],
                knownColourInformation:
                  actionToProgress.newKnownColourInformation[ind],
              })
            );

            const newCardsColourHinted = cardsHinted.map(
              (_, ind) => actionToProgress.newHinted[ind]
            );

            cardInformations = newCardColourInformations;
            cardsHinted = newCardsColourHinted;
            break;
        }
        // update `localReviewTurn` to represent that we have completed the update
        localReviewTurn = get(reviewTurnStore);
      } else {
        // we are moving backwards and need to undo an action
        const actionToUndo = localActionStore[get(reviewTurnStore)];
        const maxCardId = Math.max(...cards);
        switch (actionToUndo.actionType) {
          case "PlayDiscard":
            addToast(actionToUndo, "Undoing");
            const cardId = actionToUndo.id;

            // reinsert the card in the correct position and remove the drawn card
            const previousCards = [
              ...cards.filter((id) => id < cardId), // the cards that are less than the id remain before
              cardId, // the inserted card
              ...cards.filter((id) => id > cardId && id < maxCardId), // any cards that go after it, except the final card to preserve hand size
            ];

            // insert the correct isHinted flag
            const previousCardsHinted = [
              ...extractValues(cards, cardsHinted, (id) => id < cardId),
              flagsOnCardsStore.get(cardId).isHinted, // the inserted cards most up to date flag
              ...extractValues(
                cards,
                cardsHinted,
                (id) => id > cardId && id < maxCardId
              ), // any flags from any cards that go after it, except the final card to preserve hand size
            ];

            // reinstate the correct card information
            const previousCardInformations = [
              ...extractValues(cards, cardInformations, (id) => id < cardId),
              informationOnCardsStore.get(cardId), // the inserted cards most up to date information
              ...extractValues(
                cards,
                cardInformations,
                (id) => id > cardId && id < maxCardId
              ), // any flags from any cards that go after it, except the final card to preserve hand size
            ];

            // update local state with previous values
            cards = previousCards;
            cardInformations = previousCardInformations;
            cardsHinted = previousCardsHinted;
            break;
          case "NumberHint":
            addToast(actionToUndo, "Undoing hint about");

            const previousCardNumberInformations = cardInformations.map(
              (cardInfo, ind): CardInformation => ({
                ...cardInfo,
                numberInformation: actionToUndo.previousNumberInformation[ind],
                knownNumberInformation:
                  actionToUndo.previousKnownNumberInformation[ind],
              })
            );

            const previousCardsNumberHinted = cardsHinted.map(
              (_, ind) => actionToUndo.previousHinted[ind]
            );

            cardInformations = previousCardNumberInformations;
            cardsHinted = previousCardsNumberHinted;
            break;
          case "ColourHint":
            addToast(actionToUndo, "Undoing hint about");

            const previousCardColourInformations = cardInformations.map(
              (cardInfo, ind): CardInformation => ({
                ...cardInfo,
                colourInformation: actionToUndo.previousColourInformation[ind],
                knownColourInformation:
                  actionToUndo.previousKnownColourInformation[ind],
              })
            );

            const previousCardsColourHinted = cardsHinted.map(
              (_, ind) => actionToUndo.previousHinted[ind]
            );

            cardInformations = previousCardColourInformations;
            cardsHinted = previousCardsColourHinted;
            break;
        }
        // update `localReviewTurn` to represent that we have completed the update
        localReviewTurn = get(reviewTurnStore);
      }
    }
  }
</script>

<div class="hand">
  {#if !$gameOrReviewStore && reviewSet}
    {#each indexesForReview as ind}
      <Card
        id={cards[ind]}
        numberInformation={cardInformations[ind].numberInformation}
        knownNumberInformation={cardInformations[ind].knownNumberInformation}
        colourInformation={cardInformations[ind].colourInformation}
        knownColourInformation={cardInformations[ind].knownColourInformation}
        note={$notesOnCardsStore.get(cards[ind]).note}
        selected={$cardsSelectedStore.has(cards[ind])}
        isHinted={cardsHinted[ind]}
        isChopMoved={$flagsOnCardsStore.get(cards[ind]).isChopMoved}
        isFinessed={$flagsOnCardsStore.get(cards[ind]).isFinessed}
        isCritical={$flagsOnCardsStore.get(cards[ind]).isCritical}
        onSelect={handleCardSelect}
      />
    {/each}
  {:else}
    {#each localCardsInHandIds as id}
      <Card
        {id}
        numberInformation={$informationOnCardsStore.get(id).numberInformation}
        knownNumberInformation={$informationOnCardsStore.get(id)
          .knownNumberInformation}
        colourInformation={$informationOnCardsStore.get(id).colourInformation}
        knownColourInformation={$informationOnCardsStore.get(id)
          .knownColourInformation}
        note={$notesOnCardsStore.get(id).note}
        selected={$cardsSelectedStore.has(id)}
        isHinted={$flagsOnCardsStore.get(id).isHinted}
        isChopMoved={$flagsOnCardsStore.get(id).isChopMoved}
        isFinessed={$flagsOnCardsStore.get(id).isFinessed}
        isCritical={$flagsOnCardsStore.get(id).isCritical}
        onSelect={handleCardSelect}
      />
    {/each}
  {/if}
  <Toaster />
</div>

<style>
  .hand {
    display: flex;
    flex: 1;
    place-items: center;
    justify-content: space-around; /* Distribute space around items */
    flex-wrap: wrap; /* Allow wrapping if needed */
    gap: 10px; /* Space between cards */
    width: 100%;
  }
</style>
