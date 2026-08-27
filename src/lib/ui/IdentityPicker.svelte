<script lang="ts">
  import type { Identity } from "../hanabi/types";
  import { identityKey } from "../hanabi/deduce";
  import { rankLabel, suitAbbreviation, type Variant } from "../hanabi/variants";
  import { suitBackground, suitInk } from "./colors";
  import Sheet from "./Sheet.svelte";

  interface Props {
    variant: Variant;
    title: string;
    subtitle?: string;
    /** When given, only these identities can be chosen. */
    allowed?: Identity[];
    /** Copies left, keyed by `identityKey`, shown as a badge. */
    counts?: Map<string, number>;
    onpick: (identity: Identity) => void;
    onclose: () => void;
  }

  let { variant, title, subtitle, allowed, counts, onpick, onclose }: Props = $props();

  // An earlier mis-entry can rule out the card you actually need, so the
  // narrowing is always escapable rather than a dead end.
  let relaxed = $state(false);
  let narrowing = $derived(
    allowed !== undefined ||
      (counts !== undefined && [...counts.values()].some((left) => left <= 0)),
  );
  let allowedKeys = $derived(allowed && !relaxed ? new Set(allowed.map(identityKey)) : undefined);

  function enabled(identity: Identity): boolean {
    if (relaxed) return true;
    if (allowedKeys && !allowedKeys.has(identityKey(identity))) return false;
    if (counts && (counts.get(identityKey(identity)) ?? 0) <= 0) return false;
    return true;
  }
</script>

<Sheet {title} {subtitle} {onclose}>
  <div class="grid" style:--cols={variant.ranks.length}>
    {#each variant.suits as suit, suitIndex (suit.name)}
      <div
        class="suit-chip"
        style:background={suitBackground(suit)}
        style:color={suitInk(suit)}
        title={suit.display}
      >
        {suitAbbreviation(variant, suitIndex)}
      </div>
      {#each variant.ranks as rank (rank)}
        {@const identity = { suitIndex, rank }}
        {@const left = counts?.get(identityKey(identity))}
        <button
          class="cell"
          style:background={suitBackground(suit)}
          style:color={suitInk(suit)}
          disabled={!enabled(identity)}
          onclick={() => onpick(identity)}
          aria-label="{suit.display} {rankLabel(rank)}"
        >
          <span class="rank">{rankLabel(rank)}</span>
          {#if left !== undefined}<span class="left">{left}</span>{/if}
        </button>
      {/each}
    {/each}
  </div>

  {#if narrowing}
    <button class="btn btn-ghost small" onclick={() => (relaxed = !relaxed)}>
      {relaxed ? "Hide cards that cannot be there" : "Show every card anyway"}
    </button>
  {/if}
</Sheet>

<style>
  .grid {
    display: grid;
    grid-template-columns: 34px repeat(var(--cols), 1fr);
    gap: 6px;
    align-items: stretch;
  }

  .suit-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 800;
    font-size: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .cell {
    position: relative;
    min-height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell:active:not([disabled]) {
    filter: brightness(1.25);
  }

  .cell[disabled] {
    opacity: 0.18;
    cursor: default;
  }

  .rank {
    font-size: 1.15rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }

  .left {
    position: absolute;
    top: 2px;
    right: 4px;
    font-size: 0.6rem;
    font-weight: 700;
    opacity: 0.75;
  }
</style>
