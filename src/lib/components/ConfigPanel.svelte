<script lang="ts">
    import { writable } from 'svelte/store';
    import type { GameConfig } from '../stores/gameConfigStore';
    import gameConfig from '../stores/gameConfigStore';
  
    // Local component state
    let isOpen = false; // To control the visibility of the ConfigPanel
    let tempConfig: GameConfig; // Temporary storage for changes
  
    // Subscribe to the global gameConfig store
    gameConfig.subscribe(value => {
      tempConfig = { ...value };
    });
  
    // Function to open the panel
    function openPanel() {
      isOpen = true;
    }
  
    // Function to close the panel, discarding changes
    function closePanel() {
      isOpen = false;
    }
  
    // Function to save changes and close the panel
    function saveConfig() {
      gameConfig.set(tempConfig);
      closePanel();
    }
  </script>
  
  {#if isOpen}
    <div class="config-panel">
      <label for="numberOfCards">Number of Cards:</label>
      <select id="numberOfCards" bind:value={tempConfig.numberOfCards}>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
  
      <!-- Add more configuration options here if needed -->
  
      <button on:click={saveConfig}>Save</button>
      <button on:click={closePanel}>Cancel</button>
    </div>
  {/if}
  
  <button on:click={openPanel} disabled={isOpen}>Configure Game</button>
  
  <style>
  </style>
  