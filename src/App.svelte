<script lang="ts">
  import GameControls from './lib/components/GameControls.svelte';
  import Hand from './lib/components/Hand.svelte'
  import { version } from '../package.json';

  let versionText: string;
  let href: string;
  
  $: {switch (import.meta.env.BASE_URL) {
    case '/hanabi-tracker':
      versionText = `Version ${version}`
      href = `https://github.com/jparkhouse/hanabi-tracker/tree/v{version}`
      break;
    case '/hanabi-tracker/test':
      versionText = `Beta ${version}`;
      href = 'https://github.com/jparkhouse/hanabi-tracker/tree/testing'
      break;
    case '/dev':
      versionText = `Dev ${version}`;
      href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUjcmljayBhc3RsZXkgbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA%3D'
      break;
    default:
      versionText = 'Unknown';
      href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygUjcmljayBhc3RsZXkgbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA%3D'
      break;
  }};
</script>

<main>
  <GameControls />
  <Hand />
  <div class="bottom-text">
    {versionText} ·
    <a href={href} target="_blank"><u>Check out my code!</u></a>
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