<!-- /lib/components/HintModal.svelte -->
<script lang="ts">
  import { cardsSelectedStore } from '../stores/cardsSelectedStore';
  import { cards } from '../stores/cardsStore';
  import gameConfig from '../stores/gameConfigStore';

  export let isOpen = false;

  $: variant = $gameConfig.variant;

  const numbers = [1, 2, 3, 4, 5];
  const colours = ['red', 'yellow', 'blue', 'white', 'green']; // Same order as on cards
  let selectedHint: number | string | null = null;

  function saveHint() {
    if (!selectedHint) return;
    console.log("a hint!");

    if (typeof selectedHint === 'string') {
      saveColourHint(selectedHint as string);
    }
    else if (typeof selectedHint === 'number') {
      saveNumberHint(selectedHint as number);
    }
    cardsSelectedStore.update(selected => {
      selected = new Set<number>();
      return selected;
    })
    closePanel();
  }

  function saveColourHint(colourHint:string) {
    switch (variant) {
      case 'no-variant':
        saveColourHintNoVariant(colourHint);
        break;
    //   case 'rainbows':
    //     saveColourHintRainbows(colourHint);
    //     break;
    //   case 'blacks':
    //     saveColourHintBlacks(colourHint);
    //     break;
    //   case 'rainbows-and-blacks':
    //     saveColourHintRainbowsAndBlacks(colourHint);
    //     break;
    }
  }

  function saveColourHintNoVariant(colourHint: string) {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const colourIndex = colours.findIndex(colour => colour === colourHint);

    cards.updateCards(selected => {
      const updated = selected.map(card => {
        // Determine new colour information based on whether the card is selected
        const newColourInformation = card.colourInformation.map((value, idx) => {
          if (selectedCardIds.includes(card.id)) {
            // If the card is selected, mark the colourIndex as true and others as false
            return idx === colourIndex ? true : false;
          } else {
            // If the card is not selected, keep existing value except the colourIndex to false
            return idx !== colourIndex ? value : false;
          }
        });
        // Return a new card object with the updated colour information
        return { ...card, colourInformation: newColourInformation };
      });
      return updated;
    });
}

  function saveColourHintRainbows(colourHint: string) {
    const selectedCardIds = Array.from($cardsSelectedStore);
    const colourIndex = colours.findIndex(colour => colour === colourHint);

    cards.updateCards(selected => {
      let updated = selected;
      updated.forEach((card, index) => {
        if (selectedCardIds.includes(card.id)) { // if the card is selected
          if (card.colourInformation[5] === null && card.colourInformation[colourIndex] === null) { // if this card has not been touched by this colour hint before
            card.colourInformation.forEach((value, i) => {
              if (i != colourIndex || i < 5) {
                card.colourInformation[i] = false;
              }
              else {
                card.colourInformation[i] = null; // still unknown if it is either colour or rainbow
              }
            })
          }
          if (card.colourInformation[5] === null && card.colourInformation[colourIndex] === false) { // if this card has been touched by a different colour hint before
            card.colourInformation.forEach((value, i) => {
              if (i < 5) { // it is rainbow
                card.colourInformation[i] = false;
              }
              else {
                card.colourInformation[i] = true;
              }
            })
          }
        }
        else { // it is not this colour, or rainbow, by negative information
          card.colourInformation[colourIndex] = false;
          card.colourInformation[5] = false;
        }
      })
      return updated;
    });
  }

  function saveNumberHint(numberHint: number) {
    const selectedCardIds = Array.from($cardsSelectedStore);

    cards.updateCards(selected => {
      const updated = selected.map(card => {
        // Determine new number information based on whether the card is selected
        const newNumberInformation = card.numberInformation.map((value, idx) => {
          if (selectedCardIds.includes(card.id)) {
            // If the card is selected, mark the matching index (numberHint - 1) as true, others as false
            return idx === (numberHint - 1) ? true : false;
          } else {
            // If the card is not selected, apply negative information
            return idx !== (numberHint - 1) ? value : false;
          }
        });
        // Return a new card object with the updated number information
        return { ...card, numberInformation: newNumberInformation };
      });
      return updated;
    });
}

  
function colourToCode(colour: string): string {
  let output: string = ''
  switch (colour) {
    case ('red'):
      output = 'r';
      break;
    case ('yellow'):
      output = 'y';
      break;
    case ('blue'):
      output = 'b';
      break;
    case ('white'):
      output = 'w';
      break;
    case ('green'):
      output = 'g';
      break;
    default:
      output = '';
      console.log('invalid colour given');
  }
  return output;
}
  
function isHintValid(hint: string | number): boolean {
  let output: boolean = false;
  switch (variant) {
    case ('no-variant' || 'blacks'):
      output = isHintValidNoRainbows(hint);
    case ('rainbows' || 'rainbows-and-blacks'):
      output = isHintValidIncludingRainbows(hint);
  }
  return output;
}

function isHintValidNoRainbows(hint: string | number): boolean {
  const selectedCards = Array.from($cardsSelectedStore);

  // Check if all of the selected cards validate the hint
  const isValid = selectedCards.every(cardId => {
      const card = $cards.find(c => c.id === cardId);
      if (!card) return false; // Skip if card not found for some reason

      if (typeof hint === 'string') {
          const colourIndex = colours.indexOf(hint);
          // Hint is valid if it's not explicitly marked as false
          return (card.colourInformation[colourIndex] === null || card.colourInformation[colourIndex] === true);
      } else if (typeof hint === 'number') {
          // Hint is valid if it's not explicitly marked as false
          return (card.numberInformation[hint - 1] === null || card.numberInformation[hint - 1] === true);
      }
  });

  return isValid;
}

function isHintValidIncludingRainbows(hint: string | number): boolean {
    const selectedCards = Array.from($cardsSelectedStore);

    // Check if all of the selected cards validate the hint
    const isValid = selectedCards.every(cardId => {
        const card = $cards.find(c => c.id === cardId);
        if (!card) return false; // Skip if card not found for some reason

        if (typeof hint === 'string') {
            // Check if the card could be a rainbow
            const isRainbowPossible = card.colourInformation[5] === null || card.colourInformation[5] === true;

            if (isRainbowPossible) {
                // If a card could be a rainbow, accept all colour hints
                return true;
            } else {
                // Otherwise, check the specific colour index
                const colourIndex = colours.indexOf(hint);
                return (card.colourInformation[colourIndex] === null || card.colourInformation[colourIndex] === true);
            }
        } else if (typeof hint === 'number') {
            // Hint is valid if it's not explicitly marked as false for numbers
            return (card.numberInformation[hint - 1] === null || card.numberInformation[hint - 1] === true);
        }
    });

    return isValid;
}


  function closePanel() {
      isOpen = false;
      selectedHint = null; // Reset selected hint
  }
</script>

{#if isOpen}
<div class="modal-overlay">
  <div class="hint-modal">
      <div class="numbers-hints">
          {#each numbers as number}
              <button class="btn" hidden={!isHintValid(number)} on:click={() => selectedHint = number}>{number}</button>
          {/each}
      </div>
      <div class="colours-hints">
          {#each colours as colour}
              <button class="btn" hidden={!isHintValid(colour)} on:click={() => selectedHint = colour}>{colour}</button>
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
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.numbers-hints{
  padding: 20px;
  gap: 10px;
}

.colours-hints{
  padding: 20px;
  gap: 10px;
}

</style>
