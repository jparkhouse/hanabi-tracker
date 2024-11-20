<!-- /lib/components/colour-icons/Red.svelte -->

<script lang="ts">
  import { SuitEnum } from "../models/variantEnums";
  import Black from "./suit-icons/Black.svelte";
  import Blue from "./suit-icons/Blue.svelte";
  import Green from "./suit-icons/Green.svelte";
  import Rainbow from "./suit-icons/Rainbow.svelte";
  import RainbowEmpty from "./suit-icons/RainbowEmpty.svelte";
  import Red from "./suit-icons/Red.svelte";
  import White from "./suit-icons/White.svelte";
  import Yellow from "./suit-icons/Yellow.svelte";

  export let strokeColour: string = "white";
  export let colour: SuitEnum = SuitEnum.Red;
  export let isOnlyRainbow: boolean = false;
</script>

{#if colour === SuitEnum.Red}
  <Red {strokeColour} />
{/if}
{#if colour === SuitEnum.Yellow}
  <Yellow {strokeColour} />
{/if}
{#if colour === SuitEnum.Blue}
  <Blue {strokeColour} />
{/if}
{#if colour === SuitEnum.White}
  <White {strokeColour} />
{/if}
{#if colour === SuitEnum.Green}
  <Green {strokeColour} />
{/if}
{#if colour === SuitEnum.Rainbow && isOnlyRainbow === false}
  <Rainbow {strokeColour} />
{/if}
{#if colour === SuitEnum.Rainbow && isOnlyRainbow === true}
  <RainbowEmpty />
{/if}
{#if colour === SuitEnum.Black}
  <Black {strokeColour} />
{/if}
