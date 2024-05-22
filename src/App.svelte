<script lang="ts">
  import GameControls from './lib/components/GameControls.svelte';
  import Hand from './lib/components/Hand.svelte'
  import { version } from '../package.json';
</script>

<main>
  <GameControls />
  <Hand />
  <div class="bottom-text">
    {import.meta.env.VITE_BASE_URL === '/hanabi-tracker' ? `Version ${version}` : `Beta ${version}`} ·
    <a href="https://github.com/jparkhouse/hanabi-tracker/" target="_blank"><u>Check out my code!</u></a>
  </div>
</main>

<style>
  .bottom-text {
    display: flex;
    flex-direction: left;
    align-content: center;
    justify-content: center;
    gap: 4px;
  }
</style>