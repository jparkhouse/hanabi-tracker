<script lang="ts">
  import GameControls from './lib/components/GameControls.svelte';
  import Hand from './lib/components/Hand.svelte'

  async function requestWakeLock() {
    try {
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen wake lock is active');

      // Listen for visibility change or page hide events to release and re-acquire the wake lock
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && wakeLock.released) {
          await navigator.wakeLock.request('screen');
          console.log('Screen wake lock is re-acquired');
        }
      });

      return wakeLock;
    } catch (err) {
      console.error(`Could not acquire wake lock: ${err}`);
    }
  }

  let supported = true;

  // Call this function when your app initializes, or when it's appropriate to acquire the wake lock
  if ('wakeLock' in navigator) {
  // Screen Wake Lock API is supported
    requestWakeLock();
  } else {
    supported = false;
  }
  
</script>

<main>
  <GameControls />
  <Hand />
  <a href="https://github.com/jparkhouse/hanabi-tracker/" target="_blank" hidden={supported}>Check out my code!</a>
</main>
