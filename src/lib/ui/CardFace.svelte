<script lang="ts">
  import { UNKNOWN, isKnown, type Identity } from "../hanabi/types";
  import type { CardKnowledge } from "../hanabi/engine";
  import {
    clueName,
    identityName,
    rankLabel,
    suitAbbreviation,
    type Variant,
  } from "../hanabi/variants";
  import { suitBackground, suitInk } from "./colors";

  interface Props {
    variant: Variant;
    identity?: Identity;
    knowledge?: CardKnowledge;
    /** For a hidden card: what it could still be. One candidate is shown as the card. */
    possibilities?: Identity[];
    size?: "sm" | "md" | "lg";
    slot?: number;
    selected?: boolean;
    dim?: boolean;
    highlight?: boolean;
    note?: string;
    onclick?: () => void;
    label?: string;
  }

  let {
    variant,
    identity = UNKNOWN,
    knowledge,
    possibilities,
    size = "md",
    slot,
    selected = false,
    dim = false,
    highlight = false,
    note,
    onclick,
    label,
  }: Props = $props();

  // A hidden card with a single remaining candidate is effectively known; show it
  // greyed out so it reads as "deduced" rather than "seen".
  let deduced = $derived(
    !isKnown(identity) && possibilities?.length === 1 ? possibilities[0] : undefined,
  );
  let shown = $derived(isKnown(identity) ? identity : deduced);
  let suit = $derived(shown ? variant.suits[shown.suitIndex] : undefined);

  let accessibleName = $derived(
    label ??
      (isKnown(identity)
        ? identityName(variant, identity)
        : deduced
          ? `probably ${identityName(variant, deduced)}`
          : "unknown card"),
  );
</script>

<svelte:element
  this={onclick ? "button" : "div"}
  type={onclick ? "button" : undefined}
  class="card {size}"
  class:selected
  class:dim
  class:highlight
  class:clued={knowledge?.clued}
  class:deduced={!isKnown(identity) && deduced !== undefined}
  class:unknown={!shown}
  style:background={shown ? suitBackground(suit) : undefined}
  style:color={shown ? suitInk(suit) : undefined}
  role={onclick ? "button" : "img"}
  aria-label={accessibleName}
  aria-pressed={onclick ? selected : undefined}
  {onclick}
>
  {#if shown}
    <span class="rank">{rankLabel(shown.rank)}</span>
    <span class="suit">{suitAbbreviation(variant, shown.suitIndex)}</span>
  {:else}
    <span class="rank faint">?</span>
    {#if knowledge && (knowledge.positiveRanks.length > 0 || knowledge.positiveColors.length > 0)}
      <span class="chips">
        {#each knowledge.positiveRanks as rank (rank)}
          <span class="chip">{clueName(variant, { kind: "rank", value: rank })}</span>
        {/each}
        {#each knowledge.positiveColors as color (color)}
          <!-- The colour's own swatch, not a suit's: one colour may name several
               suits (Ambiguous) and one suit several colours (Dual-Color). -->
          <span class="chip dot" style:background={variant.clueColors[color]?.fill}></span>
        {/each}
      </span>
    {/if}
    {#if possibilities && possibilities.length > 1 && possibilities.length <= 4}
      <span class="maybe">{possibilities.map((p) => identityName(variant, p)).join(" ")}</span>
    {/if}
  {/if}

  {#if slot !== undefined}
    <span class="slot">{slot}</span>
  {/if}
  {#if note}
    <span class="note-dot" title={note}></span>
  {/if}
</svelte:element>

<style>
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--panel-3);
    color: var(--text);
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
    flex: none;
    overflow: hidden;
    padding: 0;
    text-align: center;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  .sm {
    width: 34px;
    height: 48px;
  }
  .md {
    width: 44px;
    height: 62px;
  }
  .lg {
    width: 58px;
    height: 82px;
  }

  .rank {
    font-weight: 800;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }
  .sm .rank {
    font-size: 1.1rem;
  }
  .md .rank {
    font-size: 1.5rem;
  }
  .lg .rank {
    font-size: 2rem;
  }

  .faint {
    color: var(--muted);
  }

  .suit {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    opacity: 0.85;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }

  .deduced {
    filter: saturate(0.55) brightness(0.8);
    border-style: dashed;
  }

  .unknown {
    background:
      repeating-linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.03) 0 6px,
        transparent 6px 12px
      ),
      var(--panel-3);
  }

  .clued {
    border-color: var(--warn);
    box-shadow: 0 0 0 1px var(--warn);
  }

  .selected {
    transform: translateY(-4px);
    box-shadow: 0 0 0 3px var(--accent);
  }

  .highlight {
    box-shadow: 0 0 0 3px var(--good);
  }

  .dim {
    opacity: 0.35;
  }

  .chips {
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: center;
  }

  .chip {
    min-width: 12px;
    height: 12px;
    border-radius: 4px;
    background: var(--panel);
    border: 1px solid var(--line);
    font-size: 0.6rem;
    font-weight: 700;
    line-height: 10px;
  }

  .chip.dot {
    width: 12px;
    border-radius: 999px;
  }

  .maybe {
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0;
    font-size: 0.5rem;
    line-height: 1.15;
    color: var(--muted);
    word-break: break-all;
  }

  .slot {
    position: absolute;
    bottom: 1px;
    right: 3px;
    font-size: 0.55rem;
    font-weight: 700;
    opacity: 0.65;
  }

  .note-dot {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--accent);
  }
</style>
