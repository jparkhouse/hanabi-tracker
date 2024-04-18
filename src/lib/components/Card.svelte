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
    <Yellow
      hidden={!getSuits(colourInformation).includes(SuitEnum.Yellow)}
      strokeColour={knownColour !== "yellow" ? "white" : "black"}
    />
    <Blue hidden={!getSuits(colourInformation).includes(SuitEnum.Blue)} />
    <White
      hidden={!getSuits(colourInformation).includes(SuitEnum.White)}
      strokeColour={knownColour !== "white" ? "white" : "black"}
    />
    <Green hidden={!getSuits(colourInformation).includes(SuitEnum.Green)} />
    <Rainbow
      hidden={!(
        getSuits(colourInformation).includes(SuitEnum.Rainbow) &&
        knownColour == null
      )}
    />
    <RainbowEmpty
      hidden={!(
        getSuits(colourInformation).includes(SuitEnum.Rainbow) &&
        knownColour == "rainbow"
      )}
    />
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
    width: calc(100% / 3 - 2px);
    aspect-ratio: 3/4;
  }

  .card.no-4 {
    width: calc(100% / 4 - 2px);
    aspect-ratio: 3/4;
  }

  .card.no-5 {
    width: calc(100% / 5 - 2px);
    aspect-ratio: 3/4;
  }

  .card .card-id {
    height: 10%;
    display: flex;
    align-items: center; /* Center the content vertically */
    justify-content: center; /* Center the content horizontally */
  }

  .card .number-icons {
    height: 45%;
    display: flex;
    flex-wrap: nowrap; /* Prevent wrapping for number icons */
    align-items: center;
    justify-content: center;
    width: 100%; /* adding this fixed the number icons but not the colour icons */
  }

  .card .colour-icons {
    display: grid; /* Use grid layout */
    grid-template-columns: repeat(
      auto-fit,
      minmax(35px, 1fr)
    ); /* Create as many columns as can fit, but not less than 30px */
    grid-template-rows: repeat(
      auto-fit,
      minmax(35px, 1fr)
    ); /* Create as many columns as can fit, but not less than 30px */
    grid-auto-flow: row dense;
    grid-gap: 2px; /* Set gap between icons */
    align-items: center; /* Center items vertically */
    justify-items: center; /* Center items horizontally */
    height: 45%; /* Set the height */
    overflow: hidden; /* Prevent overflow */
  }

  .number-icons > *,
  .colour-icons > * {
    flex: 1 1 auto; /* Grow to fill the space, no shrinking, no automatic basis */
    margin: 4px; /* Optional: for spacing */
    display: flex; /* To center icon content */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
  }

  @media (max-width: 600px) {
    .number-icons > *,
    .colour-icons > * {
      min-width: 30px; /* Smaller size for smaller screens */
      min-height: 30px;
    }
  }
</style>
