<!-- /lib/components/Card.svelte -->

<script lang="ts">
  import gameConfig from "../stores/gameConfigStore";

  export let id: number;
  export let numberInformation: (boolean | null)[];
  export let colourInformation: (boolean | null)[];
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
    const knownColourIndex = colourInformation.findIndex(
      (value) => value === true
    );
    if (knownColourIndex === -1) {
      knownColour = null;
    } else {
      knownColour = getColourCodeByIndex(knownColourIndex);
    }
  }

  let icons: (string | null)[] = []; // This will store the SVG paths or components for the relevant icons

  $: {
    icons = colourInformation
      .map((value, index) => {
        if (value === true || value === null) {
          return `src/assets/${getColourCodeByIndex(index)}.svg`; // Assuming SVGs are stored as files and accessible via path
        }
        return null;
      })
      .filter(Boolean);
  }

  // Utility to decode colour information into readable format
  function decodeColour(colourInfo: (boolean | null)[]): string {
    let output: string = colourInfo
      .map((value, index) =>
        value === true || value === null ? getColourCodeByIndex(index) : ""
      )
      .join(" ");
    return output;
  }

  // Utility to decode number information into readable format
  function decodeNumber(numberInfo: (boolean | null)[]): string {
    let output: string = numberInfo
      .map((value, index) =>
        value === true || value === null ? (index + 1).toString() : ""
      )
      .join(" ");
    return output;
  }

  function getColourCodeByIndex(index: number): string {
    if (index < 5) {
      return ["red", "yellow", "blue", "white", "green"][index];
    }
    if (variant == "blacks" && index == 5) {
      return "black";
    }
    if (variant == "rainbows" && index == 5) {
      return "rainbow";
    }
    if (variant == "rainbows-and-blacks" && index == 5) {
      return "rainbow";
    }
    if (variant == "rainbows-and-blacks" && index == 6) {
      return "black";
    } else {
      console.log(
        "Index {index} out of range for card {self.id} and variant {variant}"
      );
      return "err";
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
  <p>Card {id + 1}</p>
  <p>{decodeNumber(numberInformation)}</p>
  <div class="icons">
    {#each icons as icon}
      <img src={icon} alt="colour icon" class="icon" />
    {/each}
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
    padding: 10px;
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

  .icons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30px, 1fr)); /* Create as many columns as possible, with a minimum width of 20px */
    grid-auto-rows: minmax(30px, auto); /* Rows should be at least 20px high */
    gap: 5px; /* Space between icons */
    justify-content: center; /* Center the entire grid horizontally */
    align-content: center; /* Center the entire grid vertically when there's extra space */
    max-width: 100%; /* Ensure the grid doesn't exceed the card's width */
    margin: auto; /* Center the grid within the card */
}


  .icon {
    width: 100%; /* Ensure SVG icons scale within the grid */
    min-width: 30px; /* Adjust based on your preferred icon size */
  }
</style>
