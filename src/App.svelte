<script lang="ts">
  import GameControls from './lib/components/GameControls.svelte';
  import Hand from './lib/components/Hand.svelte'
  import { version } from '../package.json';

  let versionText: string;
  
  $: {switch (import.meta.env.BASE_URL) {
    case '/hanabi-tracker':
      versionText = `Version ${version}`
      break;
    case '/hanabi-tracker/test':
      versionText = `Beta ${version}`;
      break;
    case '/dev':
      versionText = `Dev ${version}`;
      break;
    default:
      versionText = 'Unknown';
      break;
  }};
</script>

<main>
  <GameControls />
  <Hand />
  <div class="bottom-text">
    {versionText} ·
    <a href="https://github.com/jparkhouse/hanabi-tracker/tree/v{version}" target="_blank"><u>Check out my code!</u></a>
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