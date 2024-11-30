<!-- /lib/components/number-icons/Numbers.svelte -->

<script lang="ts">
  import { NumberEnum } from "../models/numberEnums";
  import Five from "./number-icons/Five.svelte";
  import Four from "./number-icons/Four.svelte";
  import One from "./number-icons/One.svelte";
  import Three from "./number-icons/Three.svelte";
  import Two from "./number-icons/Two.svelte";

  export let backgroundColour: string = "blue";
  export let strokeColour: string = "none";
  export let numberEnum: NumberEnum | null = null;
</script>

{#if numberEnum === NumberEnum.One}
  <One {backgroundColour} {strokeColour} />
{/if}
{#if numberEnum === NumberEnum.Two}
  <Two {backgroundColour} {strokeColour} />
{/if}
{#if numberEnum === NumberEnum.Three}
  <Three {backgroundColour} {strokeColour} />
{/if}
{#if numberEnum === NumberEnum.Four}
  <Four {backgroundColour} {strokeColour} />
{/if}
{#if numberEnum === NumberEnum.Five}
  <Five {backgroundColour} {strokeColour} />
{/if}
