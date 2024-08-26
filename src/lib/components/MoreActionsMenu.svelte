<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import type { WebAction } from "../models/webAction";
  import MarkModal from "./MarkModal.svelte";
  import NotesModal from "./NotesModal.svelte";
  import { cardsSelectedStore } from "../stores/cardsSelectedStore";

  export let actions: WebAction[] = [];
  const dispatch = createEventDispatcher();
  let isOpen = false;
  let isMarkModalOpen = false;
  let isNotesModalOpen = false;

  let anyCardsSelected = false;
  $: {
    if ($cardsSelectedStore.size > 0) {
      anyCardsSelected = true;
    } else {
      anyCardsSelected = false;
    }
  }

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function handleAction(action: () => void) {
    action();
    isOpen = false; // Close the menu after an action is taken
    dispatch("actionSelected");
  }

  onMount(() => {
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu")) {
        isOpen = false;
      }
    };

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  });
</script>

<div class="menu">
  <button on:click={toggleMenu}>⋮</button>
  {#if isOpen}
    <div class="dropdown">
      {#each actions as { label, action }}
        <button class="dropdown-item" on:click={() => handleAction(action)}>
          {label}
        </button>
      {/each}
      <button
        class="dropdown-item"
        hidden={!anyCardsSelected}
        on:click={() => {
          isMarkModalOpen = !isMarkModalOpen;
        }}
      >
        Bulk toggle flags
      </button>
      <button
        class="dropdown-item"
        hidden={!anyCardsSelected}
        on:click={() => {
          isNotesModalOpen = !isNotesModalOpen;
        }}
      >
        Bulk manage notes
      </button>
    </div>
  {/if}
</div>

<MarkModal bind:isOpen={isMarkModalOpen} />
<NotesModal bind:isOpen={isNotesModalOpen} />

<style>
  :root {
    /* Light mode colors */
    --background-color-light: white;
    --border-color-light: #ccc;
    --item-background-light: #f0f0f0;
    --item-hover-background-light: #e0e0e0;
    --text-color-light: black;

    /* Dark mode colors */
    --background-color-dark: #2c2c2c;
    --border-color-dark: #444;
    --item-background-dark: #3a3a3a;
    --item-hover-background-dark: #555;
    --text-color-dark: white;
  }

  .menu {
    position: relative;
  }

  .dropdown {
    position: absolute;
    right: 0;
    background: var(--background-color-light); /* Default to light mode */
    border: 1px solid var(--border-color-light);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    z-index: 100;
    width: auto; /* Use auto width */
    min-width: 150px; /* Set a minimum width for better appearance */
    padding: 5px 0; /* Optional: add padding for aesthetics */
  }

  .dropdown-item {
    padding: 8px 12px;
    cursor: pointer;
    color: var(--text-color-light); /* Default text color */
    background: var(--item-background-light); /* Default item background */
  }

  .dropdown-item:hover {
    background: var(--item-hover-background-light); /* Default hover background */
  }

  /* Dark mode styles */
  @media (prefers-color-scheme: dark) {
    .dropdown {
      background: var(--background-color-dark);
      border: 1px solid var(--border-color-dark);
    }

    .dropdown-item {
      color: var(--text-color-dark);
      background: var(--item-background-dark);
    }

    .dropdown-item:hover {
      background: var(--item-hover-background-dark);
    }
  }
</style>

