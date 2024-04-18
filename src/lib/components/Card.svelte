<!-- /lib/components/Card.svelte -->

<script lang="ts">
  import gameConfig from "../stores/gameConfigStore";
  import { Variant, SuitEnum, getSuits } from "../models/variantEnums";
  import { NumberEnum, getNumbers } from "../models/numberEnums";
  import One from "./number-icons/One.svelte";
  import Three from "./number-icons/Three.svelte";
  import Two from "./number-icons/Two.svelte";
  import Four from "./number-icons/Four.svelte";
  import Five from "./number-icons/Five.svelte";
  import Red from "./suit-icons/Red.svelte";
  import Yellow from "./suit-icons/Yellow.svelte";
  import Blue from "./suit-icons/Blue.svelte";
  import White from "./suit-icons/White.svelte";
  import Green from "./suit-icons/Green.svelte";
  import Rainbow from "./suit-icons/Rainbow.svelte";
  import RainbowEmpty from "./suit-icons/RainbowEmpty.svelte";
  import Black from "./suit-icons/Black.svelte";

  export let id: number;
  export let numberInformation: NumberEnum;
  export let colourInformation: SuitEnum;
  export let selected: boolean = false;
  export let isHinted: boolean;
  export let isFinessed: boolean;
  export let isChopMoved: boolean;
  export let isCritical: boolean;
  export let onSelect: (id: number) => void;

  $: variant = $gameConfig.variant;
  $: numberOfCards = $gameConfig.numberOfCards;
  $: borderColour = selected
    ? "blue"
    : isCritical
      ? "red"
      : isHinted
        ? "orange"
        : isFinessed
          ? "aqua"
          : isChopMoved
            ? "white"
            : "gray";

  let knownColour: string | null = null;
  $: {
    if ((colourInformation & (colourInformation - 1)) == 0) {
      knownColour = getColourCodeFromSuit(colourInformation);
    } else {
      knownColour = null;
    }
  }

  interface NumberIconStyles {
    backgroundColour: string;
    strokeColour: string;
  }

  let numberIconStyles: NumberIconStyles = {
    backgroundColour: "white",
    strokeColour: "none",
  };

  $: {
    switch (knownColour) {
      case "red":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "none";
        break;
      case "blue":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "none";
        break;
      case "green":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "none";
        break;
      case "black":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "none";
        break;
      case "rainbow":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "none";
        break;
      case "yellow":
        numberIconStyles.strokeColour = "black";
        numberIconStyles.backgroundColour = "none";
        break;
      case "white":
        numberIconStyles.strokeColour = "black";
        numberIconStyles.backgroundColour = "none";
        break;
      default:
        numberIconStyles.backgroundColour = "white";
        numberIconStyles.strokeColour = "none";
    }
  }

  function getColourCodeFromSuit(suit: SuitEnum): string {
    switch (suit) {
      case SuitEnum.Red:
        return "red";
      case SuitEnum.Yellow:
        return "yellow";
      case SuitEnum.Blue:
        return "blue";
      case SuitEnum.White:
        return "white";
      case SuitEnum.Green:
        return "green";
      case SuitEnum.Rainbow:
        return "rainbow";
      case SuitEnum.Black:
        return "black";
    }
  }
</script>

<div
  class="card no-{numberOfCards} {knownColour != null ? knownColour : ''}"
  tabindex="0"
  role="button"
  on:click={() => onSelect(id)}
  on:keydown={(event) =>
    (event.key === "Enter" || event.key === " ") && onSelect(id)}
  style="border-color: {borderColour};"
>
  <p class="card-id">Card {id + 1}</p>
  <div class="number-icons">
    <One
      backgroundColour={numberIconStyles.backgroundColour}
      strokeColour={numberIconStyles.strokeColour}
      hidden={!(
        getNumbers(numberInformation).includes(NumberEnum.One) ||
        getNumbers(numberInformation).includes(NumberEnum.All)
      )}
    />
    <Two
      backgroundColour={numberIconStyles.backgroundColour}
      strokeColour={numberIconStyles.strokeColour}
      hidden={!(
        getNumbers(numberInformation).includes(NumberEnum.Two) ||
        getNumbers(numberInformation).includes(NumberEnum.All)
      )}
    />
    <Three
      backgroundColour={numberIconStyles.backgroundColour}
      strokeColour={numberIconStyles.strokeColour}
      hidden={!(
        getNumbers(numberInformation).includes(NumberEnum.Three) ||
        getNumbers(numberInformation).includes(NumberEnum.All)
      )}
    />
    <Four
      backgroundColour={numberIconStyles.backgroundColour}
      strokeColour={numberIconStyles.strokeColour}
      hidden={!(
        getNumbers(numberInformation).includes(NumberEnum.Four) ||
        getNumbers(numberInformation).includes(NumberEnum.All)
      )}
    />
    <Five
      backgroundColour={numberIconStyles.backgroundColour}
      strokeColour={numberIconStyles.strokeColour}
      hidden={!(
        getNumbers(numberInformation).includes(NumberEnum.Five) ||
        getNumbers(numberInformation).includes(NumberEnum.All)
      )}
    />
  </div>
  <div class="colour-icons">
    <Red hidden={!getSuits(colourInformation).includes(SuitEnum.Red)} />
    <Yellow hidden={!getSuits(colourInformation).includes(SuitEnum.Yellow)} />
    <Blue hidden={!getSuits(colourInformation).includes(SuitEnum.Blue)} />
    <White hidden={!getSuits(colourInformation).includes(SuitEnum.White)} />
    <Green hidden={!getSuits(colourInformation).includes(SuitEnum.Green)} />
    <Rainbow hidden={!(getSuits(colourInformation).includes(SuitEnum.Rainbow) && knownColour == null)} />
    <RainbowEmpty hidden={!(getSuits(colourInformation).includes(SuitEnum.Rainbow) && knownColour == 'rainbow')} />
    <Black hidden={!getSuits(colourInformation).includes(SuitEnum.Black)} />
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    justify-content: center; /* Align children vertically in the center */
    align-items: center; /* Align children horizontally in the center */
    background-color: dimgray;
    color: white;
    border: 3px solid;
    border-radius: 8px;
    padding: 5px;
    cursor: pointer;
    min-width: 100px; /* Minimum width for a card */
    margin: 5px; /* Margin around cards */
    align-content: center; /* Center text inside cards */
    flex: 1;
    font-size: 3vw;
    height: 70vh;
    min-height: 150px;
    overflow: hidden;
  }

  .card-id {
    height: 10%;
  }

  .rainbow {
    background-image: linear-gradient(
      to bottom right,
      red,
      orange,
      yellow,
      green,
      blue,
      indigo,
      violet
    );
    color: white;
    text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000; /* Black text shadow to create outline effect */
  }

  .black {
    background-color: #000;
    color: white;
  }

  .red {
    background-color: red;
    color: white;
  }

  .blue {
    background-color: navy;
    color: white;
  }

  .green {
    background-color: darkgreen;
    color: white;
  }

  .white {
    background-color: white;
    color: black;
  }

  .yellow {
    background-color: yellow;
    color: black;
  }

  .card.no-3 {
    width: calc(100% / 3);
    aspect-ratio: 3/4;
  }

  .card.no-4 {
    width: calc(100% / 4);
    aspect-ratio: 3/4;
  }

  .card.no-5 {
    width: calc(100% / 5);
    aspect-ratio: 3/4;
  }

  .colour-icons {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center; /* Center the icons horizontally */
    align-items: center; /* Align icons vertically */
    gap: 5px; /* Space between icons */
    max-width: 100%; /* Ensure the grid doesn't exceed the card's width */
    max-height: 30%; /* Adjust based on the height of the icons */
    margin: auto; /* Center the grid within the card */
  }

  .number-icons {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center; /* Center the icons horizontally */
    align-items: center; /* Align icons vertically */
    gap: 5px; /* Space between icons */
    max-width: 100%; /* Ensure the grid doesn't exceed the card's width */
    height: 20%; /* Adjust based on the height of the icons */
    margin: auto; /* Center the grid within the card */
  }

  .number-icon {
    width: auto; /* Ensure SVG icons scale within the grid */
    min-height: 30px; /* Adjust based on your preferred icon size */
  }

  .colour-icon {
    width: auto;
    min-width: 30px; /* Adjust based on your preferred icon size */
  }
</style>
