<script lang="ts">
  import { clueTokenLabel, pace, type GameState } from "../hanabi/engine";
  import { MAX_CLUE_TOKENS, MAX_STRIKES } from "../hanabi/types";
  import { rankLabel, suitAbbreviation } from "../hanabi/variants";
  import { suitBackground, suitInk } from "../ui/colors";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();
  let currentPace = $derived(pace(game));
  // Throw It in a Hole players never see what they have scored, so neither does
  // the strip until the game is over.
  let hidesScore = $derived(game.variant.rules.throwItInAHole && !game.finished);
  // Reversed and Up or Down stacks run downwards, so the chip shows the card on
  // top rather than a height.
  let topOf = (suitIndex: number) =>
    game.playStacks[suitIndex] ? rankLabel(game.playStacks[suitIndex]) : "–";
</script>

<section class="strip">
  <div class="stacks" role="list" aria-label="Play stacks">
    {#each game.variant.suits as suit, suitIndex (suit.name)}
      <div
        class="stack-chip"
        role="listitem"
        style:background={suitBackground(suit)}
        style:color={suitInk(suit)}
        class:empty={game.playStacks[suitIndex] === 0}
        aria-label="{suit.display}: {game.playStacks[suitIndex]
          ? `${topOf(suitIndex)} on top`
          : 'nothing played'}"
      >
        <span class="rank">{topOf(suitIndex)}</span>
        <span class="abbr">{suitAbbreviation(game.variant, suitIndex)}</span>
      </div>
    {/each}
  </div>

  <div class="pills">
    <span class="pill" class:warn={game.clueTokens < 1}>
      🔵 {clueTokenLabel(game.clueTokens)}/{MAX_CLUE_TOKENS}
    </span>
    <span class="pill" class:danger={game.strikes > 0}>✖ {game.strikes}/{MAX_STRIKES}</span>
    <span class="pill">🂠 {game.cardsRemaining}</span>
    <span class="pill" title={hidesScore ? "Hidden until the game ends" : undefined}>
      {hidesScore ? "?" : game.score}/{game.maxScore}
    </span>
    <span class="pill" class:warn={currentPace <= 0} title="Discards left before the max score slips">
      pace {currentPace}
    </span>
    {#if game.finalRoundLeft !== null && !game.finished}
      <span class="pill warn">{game.finalRoundLeft} turns left</span>
    {/if}
  </div>
</section>

<style>
  .strip {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stacks {
    display: flex;
    gap: 6px;
  }

  .stack-chip {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 0 3px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .stack-chip.empty {
    filter: saturate(0.35) brightness(0.55);
  }

  .rank {
    font-weight: 800;
    font-size: 1.15rem;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }

  .abbr {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .pill.warn {
    color: var(--warn);
    border-color: var(--warn);
  }

  .pill.danger {
    color: var(--danger);
    border-color: var(--danger);
  }
</style>
