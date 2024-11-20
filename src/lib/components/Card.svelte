<!-- /lib/components/Card.svelte -->

<script lang="ts">
  import { gameConfigStore } from "../stores/gameConfigStore";
  import { SuitEnum, suitProperties } from "../models/variantEnums";
  import { getNumbers, NumberEnum } from "../models/numberEnums";
  import { activeMenuCard } from "../stores/menuStore";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";
  import { onMount, onDestroy } from "svelte";
  import { notesOnCardsStore } from "../stores/notesOnCardsStore";
  import { flagsOnCardsStore } from "../stores/flagsOnCardsStore";

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
  import Number from "./Number.svelte";

  export let id: number;
  export let numberInformation: NumberEnum;
  export let knownNumberInformation: NumberEnum;
  export let colourInformation: SuitEnum;
  export let knownColourInformation: SuitEnum;
  export let note: string;
  export let selected: boolean = false;
  export let isHinted: boolean;
  export let isFinessed: boolean;
  export let isChopMoved: boolean;
  export let isCritical: boolean;
  export let onSelect: (id: number) => void;

  $: localMode = $activeMenuCard === id ? "menu" : "card";
  $: isMenuActive = $activeMenuCard !== null;
  $: numberOfCards = $gameConfigStore.numberOfCards;
  $: borderColour = selected
    ? "var(--border-selected)"
    : isCritical
      ? "var(--border-critical)"
      : isHinted
        ? "var(--border-hinted)"
        : isFinessed
          ? "var(--border-finessed)"
          : isChopMoved
            ? "var(--border-chopmoved)"
            : "var(--border-default)";

  let knownColour: string | null = null;
  $: {
    if (isSingleFlag(colourInformation)) {
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
    strokeColour: "black",
  };

  $: {
    switch (knownColour) {
      case "red":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "red";
        break;
      case "blue":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "mediumblue";
        break;
      case "green":
        numberIconStyles.strokeColour = "white";
        numberIconStyles.backgroundColour = "green";
        break;
      case "black":
        numberIconStyles.strokeColour = "none";
        numberIconStyles.backgroundColour = "white";
        break;
      case "rainbow":
        numberIconStyles.strokeColour = "black";
        numberIconStyles.backgroundColour = "white";
        break;
      case "yellow":
        numberIconStyles.strokeColour = "black";
        numberIconStyles.backgroundColour = "yellow";
        break;
      case "white":
        numberIconStyles.strokeColour = "black";
        numberIconStyles.backgroundColour = "white";
        break;
      default:
        numberIconStyles.backgroundColour = "lightgrey";
        numberIconStyles.strokeColour = "white";
    }
  }

  // Toggle mode function
  function toggleMode() {
    if (localMode === "card" && !isMenuActive) {
      activeMenuCard.set(id);
    } else if (localMode === "menu") {
      const noteField = (
        document.getElementById("noteField") as HTMLInputElement
      ).value as string;
      if (noteField) {
        notesOnCardsStore.set(id, { note: noteField });
      }
      activeMenuCard.set(null);
    }
    cardsSelectedStore.set(new Set<number>());
  }

  function closeMenu() {
    const noteField = (document.getElementById("noteField") as HTMLInputElement)
      .value as string;
    if ($activeMenuCard) {
      notesOnCardsStore.set($activeMenuCard, { note: noteField });
      activeMenuCard.set(null);
    }
    cardsSelectedStore.set(new Set<number>());
  }

  function getColourCodeFromSuit(suit: SuitEnum): string {
    return suitProperties[suit].string.toLowerCase();
  }

  function isSingleFlag(bitflag: SuitEnum | NumberEnum): boolean {
    return (bitflag & (bitflag - 1)) == 0;
  }

  function toggleCritical(): void {
    const oldFlags = flagsOnCardsStore.get(id);
    flagsOnCardsStore.set(id, { ...oldFlags, isCritical: !isCritical });
  }

  function toggleChopMoved(): any {
    const oldFlags = flagsOnCardsStore.get(id);
    flagsOnCardsStore.set(id, { ...oldFlags, isChopMoved: !isChopMoved });
  }

  function toggleFinessed(): any {
    const oldFlags = flagsOnCardsStore.get(id);
    flagsOnCardsStore.set(id, { ...oldFlags, isFinessed: !isFinessed });
  }

  let timeoutId: ReturnType<typeof setTimeout>;

  function handleInteractionStart(event: MouseEvent | TouchEvent): void {
    const targetElement = event.target as HTMLElement;
    // Check if the event was initiated from the card or its children
    if (targetElement.closest(".menu")) {
      return;
    }
    if (targetElement.closest(".card")) {
      event.preventDefault(); // Prevent default only if it's within the card
      timeoutId = setTimeout(() => {
        // Long press logic only triggers if the initial target was the card itself
        if (targetElement.closest(".card")) {
          toggleMode();
        }
      }, 500); // Long press delay
    }
  }

  function handleInteractionEnd(event: MouseEvent | TouchEvent): void {
    clearTimeout(timeoutId);
    const targetElement = event.target as HTMLElement;
    // Handle tap or click on the card, ignoring menu button clicks
    if (
      targetElement.closest(".card") &&
      !targetElement.closest(".menu-button") &&
      $activeMenuCard === null
    ) {
      onSelect(id); // Selection logic if not a menu button
    } else if (
      targetElement.closest(".card") &&
      !targetElement.closest(".menu-button") &&
      $activeMenuCard !== id
    ) {
      closeMenu();
    }
  }

  function handleRightClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (targetElement.closest(".card")) {
      event.preventDefault();
      toggleMode();
    }
  }

  // Function to handle global clicks for closing the menu
  function handleClickOutside(event: MouseEvent | TouchEvent): void {
    if (!$activeMenuCard) return; // Exit if no menu is active
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest(".card")) {
      closeMenu(); // Close the menu if clicked outside any card
    }
  }

  onMount(() => {
    document.body.addEventListener("click", handleClickOutside, true);
  });

  onDestroy(() => {
    document.body.removeEventListener("click", handleClickOutside, true);
  });
</script>

<div
  class="card no-{numberOfCards} {knownColour != null
    ? knownColour
    : ''} {selected ? 'selected' : ''}"
  tabindex="0"
  role="button"
  on:contextmenu|preventDefault={handleRightClick}
  on:mousedown={handleInteractionStart}
  on:mouseup={handleInteractionEnd}
  on:touchstart={handleInteractionStart}
  on:touchend={handleInteractionEnd}
  on:touchcancel={handleInteractionEnd}
  style="border-color: {borderColour};"
>
  {#if $activeMenuCard !== id}
    <p class="card-id">{note !== "" ? note : "Card " + (id + 1)}</p>
    <div class="number-icons">
      {#each getNumbers(numberInformation) as numberEnum}
        <Number
          backgroundColour={numberIconStyles.backgroundColour}
          strokeColour={knownNumberInformation & numberEnum &&
          !isSingleFlag(numberInformation)
            ? "var(--border-hinted)"
            : numberIconStyles.strokeColour}
          numberEnum={numberEnum}
        />
      {/each}
    </div>
    <div class="colour-icons">
      <Red
        hidden={!(colourInformation & SuitEnum.Red)}
        strokeColour={knownColourInformation & SuitEnum.Red &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : numberIconStyles.strokeColour}
      />
      <Yellow
        hidden={!(colourInformation & SuitEnum.Yellow)}
        strokeColour={knownColourInformation & SuitEnum.Yellow &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : numberIconStyles.strokeColour}
      />
      <Blue
        hidden={!(colourInformation & SuitEnum.Blue)}
        strokeColour={knownColourInformation & SuitEnum.Blue &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : numberIconStyles.strokeColour}
      />
      <White
        hidden={!(colourInformation & SuitEnum.White)}
        strokeColour={knownColourInformation & SuitEnum.White &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : numberIconStyles.strokeColour}
      />
      <Green
        hidden={!(colourInformation & SuitEnum.Green)}
        strokeColour={knownColourInformation & SuitEnum.Green &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : numberIconStyles.strokeColour}
      />
      <Rainbow
        hidden={!(colourInformation & SuitEnum.Rainbow) ||
          knownColour === "rainbow"}
        strokeColour={knownColourInformation & SuitEnum.Rainbow &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : "white"}
      />
      <RainbowEmpty
        hidden={!(
          colourInformation & SuitEnum.Rainbow && knownColour === "rainbow"
        )}
        strokeColour={knownColourInformation & SuitEnum.Rainbow &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : "white"}
      />
      <Black
        hidden={!(colourInformation & SuitEnum.Black)}
        strokeColour={knownColourInformation & SuitEnum.Black &&
        !isSingleFlag(colourInformation)
          ? "var(--border-hinted)"
          : "white"}
      />
    </div>
  {:else}
    <div
      class="menu no-{numberOfCards} {knownColour != null ? knownColour : ''}"
    >
      <p class="card-id">Card {id + 1}</p>
      <button
        class="btn menu-button {isCritical ? 'selected' : ''}"
        on:click={() => toggleCritical()}>Critical</button
      >
      <button
        class="btn menu-button {isChopMoved ? 'selected' : ''}"
        on:click={() => toggleChopMoved()}>Chop moved</button
      >
      <button
        class="btn menu-button {isFinessed ? 'selected' : ''}"
        on:click={() => toggleFinessed()}>Finessed</button
      >
      <input
        class="note-field"
        id="noteField"
        type="text"
        bind:value={note}
        placeholder="Its a..."
      />
      <button class="btn menu-button close-button" on:click={toggleMode}
        >Close</button
      >
    </div>
  {/if}
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    justify-content: center; /* Align children vertically in the center */
    align-items: center; /* Align children horizontally in the center */
    background-color: dimgray;
    color: white;
    border: 6px solid;
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

  .selected {
    filter: brightness(1.2);
  }

  .card-id {
    height: 10%;
    width: 100%; /* Full width to fit within the card */
    padding: 4px;
    font-size: 14px; /* Slightly smaller font for the note display */
    word-wrap: break-word; /* Ensures long words do not overflow */
    overflow: hidden; /* Hides text that overflows the y-axis */
    text-overflow: ellipsis; /* Adds an ellipsis to indicate text overflow */
    display: block;
    max-height: 4.2em; /* Maximum height to show three lines */
    margin-bottom: 10px; /* Space below the note for clarity */
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

  .black.selected {
    background-color: #151515;
  }

  .red {
    background-color: #c00;
    color: white;
  }

  .blue {
    background-color: midnightblue;
    color: white;
  }

  .green {
    background-color: darkgreen;
    color: white;
  }

  .white {
    background-color: whitesmoke;
    color: black;
  }

  .yellow {
    background-color: gold;
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
    grid-auto-flow: row dense;
    grid-gap: 2px; /* Set gap between icons */
    justify-items: center; /* Center items horizontally */
    height: 40%; /* Set the height */
    padding-top: 5px;
  }

  .number-icons > *,
  .colour-icons > * {
    flex: 1 1 auto; /* Grow to fill the space, no shrinking, no automatic basis */
    margin: 4px; /* Optional: for spacing */
    display: flex; /* To center icon content */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    max-width: 100%;
    max-height: 100%;
    transform: rotate(1);
    pointer-events: none;
    will-change: transform;
  }

  @media (max-width: 600px) {
    .number-icons > *,
    .colour-icons > * {
      min-width: 30px; /* Smaller size for smaller screens */
      min-height: 30px;
    }
  }

  .menu-buttons {
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px; /* Space between buttons */
    width: 100%;
    height: 40%;
  }

  .note-config {
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px; /* Space between buttons */
    width: 100%;
    height: 40%;
  }

  .menu {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .menu-button {
    border: 2px solid #cccccc; /* Light grey border */
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    width: 90%;
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .note-field {
    box-sizing: border-box;
    border: 2px solid #cccccc; /* Light grey border */
    border-radius: 2px;
    padding: 10px;
    cursor: text;
    width: 90%;
    margin-top: 2px;
    margin-bottom: 2px;
  }

  .menu-button.selected {
    background-color: lightblue;
    color: black;
  }

  .menu-button:hover {
    filter: brightness(1.2);
    cursor: pointer;
  }
</style>
