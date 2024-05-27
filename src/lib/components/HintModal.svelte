<!-- /lib/components/HintModal.svelte -->
<script lang="ts">
  import type { CardInformation } from "../models/card";
  import { NumberEnum } from "../models/numberEnums";
  import { SuitEnum, getSuits, suitProperties } from "../models/variantEnums";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { cardsInHandStore } from "../stores/cardsInHandStore";
  import { informationOnCardsStore } from "../stores/informationOnCardsStore";
  import { gameConfigStore } from "../stores/gameConfigStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

  export let isOpen = false;

  $: variant = $gameConfigStore.variant;

  $: console.log($cardsInHandStore);

  interface SelectedHint {
    type: "colour" | "number" | null;
    colourValue: SuitEnum | null;
    numberValue: NumberEnum | null;
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

  function isColourHintValid(colourHint: SuitEnum): boolean {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const isValid = $cardsInHandStore.every((card) => {
      const cardInformation = informationOnCardsStore.get(card);
      if (selectedCardIds.includes(card)) {
        const hintModifier: SuitEnum =
          getPositiveColourHintModifier(cardInformation);
        return (
          (cardInformation.colourInformation & (colourHint | hintModifier)) > 0
        ); // the hint is applicable if one of the card's suits is possible (1) and that hint also has a 1
      } else {
        const hintModifier: SuitEnum =
          getNegativeColourHintModifier(cardInformation);
        return (
          (cardInformation.colourInformation & ~(colourHint | hintModifier)) > 0
        ); // check that it doesnt leave any hints without any colours
      }
    });
    return isValid;
  }

  function isNumberHintValid(numberHint: NumberEnum): boolean {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const isValid = $cardsInHandStore.every((card) => {
      const cardInformation = informationOnCardsStore.get(card);
      if (selectedCardIds.includes(card)) {
        const hintModifier: NumberEnum =
          getPositiveNumberHintModifier(cardInformation);
        return (
          (cardInformation.numberInformation & (numberHint | hintModifier)) > 0
        ); // the hint is applicable if one of the card's numbers is possible (1) and that hint also has a 1
      } else {
        const hintModifier: NumberEnum =
          getNegativeNumberHintModifier(cardInformation);
        return (
          (cardInformation.numberInformation & ~(numberHint | hintModifier)) > 0
        ); // check that it doesnt leave any hints without any numbers
      }
    });
    return isValid;
  }

  function getPositiveColourHintModifier(card: CardInformation): SuitEnum {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as rainbow taking all colour clues)
      .map((value) => {
        return suitProperties[value].positiveColourHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as SuitEnum;
  }

  function getPositiveNumberHintModifier(card: CardInformation): NumberEnum {
    return getSuits(card.colourInformation) // checks for any positive hint modifiers from suits (such as pink taking all number clues)
      .map((value) => {
        return suitProperties[value].positiveNumberHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as NumberEnum;
  }

  function getNegativeColourHintModifier(card: CardInformation): SuitEnum {
    return getSuits(card.colourInformation) // checks for any negative hint modifiers from suits (such as black taking no colour clues)
      .map((value) => {
        return suitProperties[value].negativeColourHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as SuitEnum;
  }

  function getNegativeNumberHintModifier(card: CardInformation): NumberEnum {
    return getSuits(card.colourInformation) // checks for any negative hint modifiers from suits (such as brown taking no number clues)
      .map((value) => {
        return suitProperties[value].negativeNumberHintModifier;
      })
      .filter((value) => {
        return value !== null;
      })
      .reduce((result, num) => {
        return (result as number) | (num as number);
      }, 0) as NumberEnum;
  }

  function saveHint(): void {
    if (!selectedHint.type) return;

    if (selectedHint.type == "colour" && selectedHint.colourValue !== null) {
      saveColourHint(selectedHint.colourValue);
    } else if (
      selectedHint.type == "number" &&
      selectedHint.numberValue !== null
    ) {
      saveNumberHint(selectedHint.numberValue);
    }
    cardsSelectedStore.update((selected) => {
      // reset cards selected
      selected = new Set<number>();
      return selected;
    });
    closePanel();
  }

  function saveColourHint(colourHint: SuitEnum): void {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const currentCards = Array.from($cardsInHandStore);
    currentCards.forEach((card) => {
      let cardInformation = informationOnCardsStore.get(card);
      console.log(card, 'information is', cardInformation);
      let newColourInformation: SuitEnum;
      if (selectedCardIds.includes(card)) {
        const hintModifier = getPositiveColourHintModifier(cardInformation);
        newColourInformation =
          cardInformation.colourInformation & (colourHint | hintModifier);
        const oldFlags = flagsOnCardsStore.get(card);
        flagsOnCardsStore.set(card, { ...oldFlags, isHinted: true });
        console.log(card, 'is hinted');
      } else {
        const hintModifier = getNegativeColourHintModifier(cardInformation);
        newColourInformation =
          cardInformation.colourInformation & ~(colourHint | hintModifier);
      }
      const newCardInformation = {
        ...cardInformation,
        colourInformation: newColourInformation,
      };
      console.log(card, 'new information is', newCardInformation);
      informationOnCardsStore.set(card, newCardInformation);
    });
  }

  function saveNumberHint(numberHint: NumberEnum): void {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const currentCards = Array.from($cardsInHandStore);
    currentCards.forEach((card) => {
      let cardInformation = informationOnCardsStore.get(card);
      let newNumberInformation: NumberEnum;
      if (selectedCardIds.includes(card)) {
        const hintModifier = getPositiveNumberHintModifier(cardInformation);
        newNumberInformation =
          cardInformation.numberInformation & (numberHint | hintModifier);
        const oldFlags = flagsOnCardsStore.get(card);
        flagsOnCardsStore.set(card, { ...oldFlags, isHinted: true });
      } else {
        const hintModifier = getNegativeNumberHintModifier(cardInformation);
        newNumberInformation =
          cardInformation.numberInformation & ~(numberHint | hintModifier);
      }
      informationOnCardsStore.set(card, {
        ...cardInformation,
        numberInformation: newNumberInformation,
      });
    });
  }

  function isSelectedHint(
    hint: SelectedHint,
    selectedHint: SelectedHint
  ): boolean {
    const result =
      hint.type === selectedHint.type &&
      hint.colourValue === selectedHint.colourValue &&
      hint.numberValue === selectedHint.numberValue;
    return selectedHint && result;
  }

  function selectColourHint(colourHint: SuitEnum): void {
    selectedHint = {
      type: "colour",
      colourValue: colourHint,
      numberValue: null,
    };
    saveHint();
  }

  function selectNumberHint(numberHint: NumberEnum): void {
    selectedHint = {
      type: "number",
      colourValue: null,
      numberValue: numberHint,
    };
    saveHint();
  }

  function closePanel() {
    isOpen = false;
    selectedHint = {
      type: null,
      colourValue: null,
      numberValue: null,
    }; // Reset selected hint
  }
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
        <button on:click={closePanel}>Cancel</button>
      </div>
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
