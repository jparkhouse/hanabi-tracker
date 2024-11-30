<!-- /lib/components/colour-icons/Rainbow.svelte -->

<script lang="ts">
  export let strokeColour: string = "white";
</script>

<img
  src={`${import.meta.env.BASE_URL}/rainbow.svg`}
  alt="Rainbow colour icon"
  style="width: 100%; height: auto;"
/>
