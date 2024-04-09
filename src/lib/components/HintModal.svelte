<!-- /lib/components/HintModal.svelte -->
<script lang="ts">
  import type { Card } from "../models/card";
  import { NumberEnum } from "../models/numberEnums";
  import { SuitEnum, getSuits, suitProperties } from "../models/variantEnums";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cards } from "../stores/cardsStore";
  import gameConfig from "../stores/gameConfigStore";

  export let isOpen = false;

  $: variant = $gameConfig.variant;

  interface SelectedHint {
    type: "colour" | "number" | null;
    colourValue: number | null;
    numberValue: number | null;
  }

  let selectedHint: SelectedHint = {
    type: null,
    colourValue: null,
    numberValue: null,
  };

  let availableColourHintsEnums: SuitEnum[] = [];
  let availableNumberHintsStrings: (string | null)[] = [
    "1",
    "2",
    "3",
    "4",
    "5",
  ];
  let availableNumberHintsEnums: NumberEnum[] = [
    NumberEnum.One,
    NumberEnum.Two,
    NumberEnum.Three,
    NumberEnum.Four,
    NumberEnum.Five,
  ];
  $: {
    availableColourHintsEnums = getSuits(variant).filter(
      (suit) => suitProperties[suit].stringHint != null
    );
  } // this should return matching arrays of all suit Enums with a stringHint property (i.e. all hintable suits)

  function isColourHintValid(colourHint: number): boolean {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const isValid = selectedCardIds.every((cardId) => {
      const card = $cards.find((c) => c.id === cardId);
      if (!card) {
        return false;
      } else {
        const hintModifier = getPositiveColourHintModifier(card);
        return (card.colourInformation & (colourHint | hintModifier)) > 0; // the hint is applicable if one of the card's suits is possible (1) and that hint also has a 1
      }
    });
    return isValid;
  }

  function isNumberHintValid(numberHint: number): boolean {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const isValid = selectedCardIds.every((cardId) => {
      const card = $cards.find((c) => c.id === cardId);
      if (!card) {
        return false;
      } else {
        const hintModifier: number = getPositiveNumberHintModifier(card); // I hate this type assertion
        return (card.numberInformation & (numberHint | hintModifier)) > 0; // the hint is applicable if one of the card's suits is possible (1) and that hint also has a 1
      }
    });
    return isValid;
  }

  function getPositiveColourHintModifier(card: Card): number {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as brown taking all number clues)
      .map((value) => {
        return suitProperties[value].positiveColourHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as number;
  }

  function getPositiveNumberHintModifier(card: Card): number {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as brown taking all number clues)
      .map((value) => {
        return suitProperties[value].positiveNumberHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as number;
  }

  function getNegativeColourHintModifier(card: Card): number {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as brown taking all number clues)
      .map((value) => {
        return suitProperties[value].negativeColourHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as number;
  }

  function getNegativeNumberHintModifier(card: Card): number {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as brown taking all number clues)
      .map((value) => {
        return suitProperties[value].negativeNumberHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as number;
  }

  function saveHint() {
    if (!selectedHint.type) return;

    if (selectedHint.type == "colour" && selectedHint.colourValue !== null) {
      saveColourHint(selectedHint.colourValue as number);
    } else if (
      selectedHint.type == "number" &&
      selectedHint.numberValue !== null
    ) {
      saveNumberHint(selectedHint.numberValue as number);
    }
    cardsSelectedStore.update((selected) => {
      // reset cards selected
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }

  function saveColourHint(colourHint: number) {
    const selectedCardIds = Array.from($cardsSelectedStore);
    cards.updateCards((allCards) => {
      const newCards = allCards.map((card) => {
        if (selectedCardIds.includes(card.id)) {
          const hintModifier = getPositiveColourHintModifier(card);
          const newColourInformation =
            card.colourInformation & (colourHint | hintModifier);
          return {
            ...card,
            colourInformation: newColourInformation,
            isHinted: true,
          };
        } else {
          const hintModifier = getNegativeColourHintModifier(card);
          const newColourInformation =
            card.colourInformation & ~(colourHint | hintModifier);
          return {
            ...card,
            colourInformation: newColourInformation,
          };
        }
      });
      return newCards;
    });
  }

  function saveNumberHint(numberHint: number) {
    const selectedCardIds = Array.from($cardsSelectedStore);
    cards.updateCards((allCards) => {
      const newCards = allCards.map((card) => {
        if (selectedCardIds.includes(card.id)) {
          const hintModifier = getPositiveNumberHintModifier(card);
          const newNumberInformation =
            card.numberInformation & (numberHint | hintModifier);
          return {
            ...card,
            numberInformation: newNumberInformation,
            isHinted: true,
          };
        } else {
          const hintModifier = getNegativeNumberHintModifier(card);
          const newNumberInformation =
            card.numberInformation & ~(numberHint | hintModifier);
          return {
            ...card,
            numberInformation: newNumberInformation,
          };
        }
      });
      return newCards;
    });
  }

  function isSelectedHint(
    hint: SelectedHint,
    selectedHint: SelectedHint
  ): boolean {
    console.log("Checking hint:", hint, "against selectedHint:", selectedHint);
    const result =
      hint.type === selectedHint.type &&
      hint.colourValue === selectedHint.colourValue &&
      hint.numberValue === selectedHint.numberValue;
    console.log("Result:", result);
    return selectedHint && result;
  }

  function selectColourHint(colourHint: number): void {
    selectedHint = {
      type: "colour",
      colourValue: colourHint,
      numberValue: null,
    };
  }

  function selectNumberHint(numberHint: number): void {
    selectedHint = {
      type: "number",
      colourValue: null,
      numberValue: numberHint,
    };
  }

  function closePanel() {
    isOpen = false;
    selectedHint = {
      type: null,
      colourValue: null,
      numberValue: null,
    }; // Reset selected hint
  }
  $: console.log(selectedHint);
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closePanel}>
    <div class="hint-modal" on:click|stopPropagation>
      <div class="numbers-hints">
        {#each [0, 1, 2, 3, 4] as index}
          <button
            class="btn {isSelectedHint(
              {
                type: 'number',
                colourValue: null,
                numberValue: availableNumberHintsEnums[index],
              },
              selectedHint
            )
              ? 'selected'
              : ''}"
            hidden={!isNumberHintValid(availableNumberHintsEnums[index])}
            on:click={() => selectNumberHint(availableNumberHintsEnums[index])}
            >{availableNumberHintsStrings[index]}</button
          >
        {/each}
      </div>
      <div class="colours-hints">
        {#each availableColourHintsEnums as colour}
          <button
            class="btn {isSelectedHint(
              { type: 'colour', colourValue: colour, numberValue: null },
              selectedHint
            )
              ? 'selected'
              : ''}"
            hidden={!isColourHintValid(colour)}
            on:click={() => selectColourHint(colour)}
            >{suitProperties[colour].stringHint}</button
          >
        {/each}
      </div>
      <div class="actions">
        <button on:click={saveHint} disabled={!selectedHint}>Save</button>
        <button on:click={closePanel}>Cancel</button>
      </div>
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

  .hint-modal {
    background-color: dimgray;
    padding: 20px;
    border-radius: 5px;
    border: 2px solid lightgray;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .numbers-hints {
    padding: 20px;
    gap: 10px;
  }

  .colours-hints {
    padding: 20px;
    gap: 10px;
  }

  .selected {
    background-color: lightblue;
    color: black;
  }
</style>
