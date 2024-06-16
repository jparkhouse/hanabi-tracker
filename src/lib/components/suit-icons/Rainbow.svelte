<!-- /lib/components/colour-icons/Rainbow.svelte -->

<script lang="ts">
  export let hidden: boolean = true;
  export let strokeColour: string = "white";
</script>

{#if !hidden}
  <img src="/rainbow.svg" alt="Rainbow colour icon" style="width: 100%; height: auto;">
{/if}
