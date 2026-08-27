<script lang="ts">
  import { discardedCopies, isOnStack, type GameState } from "../hanabi/engine";
  import { copiesOf, rankLabel, suitAbbreviation } from "../hanabi/variants";
  import { suitBackground, suitInk } from "../ui/colors";

  interface Props {
    game: GameState;
  }

  let { game }: Props = $props();

  /**
   * Per-identity: how many copies are gone, and whether losing another would cap
   * the suit. That is the thing worth glancing at mid-game.
   */
  let grid = $derived(
    game.variant.suits.map((suit, suitIndex) =>
      game.variant.ranks.map((rank) => {
        const identity = { suitIndex, rank };
        const total = copiesOf(game.variant, identity);
        const gone = discardedCopies(game, identity);
        const played = isOnStack(game, identity);
        return {
          rank,
          suit,
          suitIndex,
          gone,
          total,
          dead: gone >= total,
          critical: !played && total - gone === 1,
        };
      }),
    ),
  );
</script>

<section class="card-panel stack">
  <div class="spread">
    <h3>Discards</h3>
    <span class="muted small">{game.discards.length} card{game.discards.length === 1 ? "" : "s"}</span>
  </div>

  <div class="grid" style:--cols={game.variant.ranks.length}>
    {#each grid as row, suitIndex (game.variant.suits[suitIndex].name)}
      <div
        class="suit"
        style:background={suitBackground(game.variant.suits[suitIndex])}
        style:color={suitInk(game.variant.suits[suitIndex])}
      >
        {suitAbbreviation(game.variant, suitIndex)}
      </div>
      {#each row as cell (cell.rank)}
        <div
          class="cell"
          class:dead={cell.dead}
          class:critical={cell.critical}
          class:none={cell.gone === 0}
          aria-label="{cell.suit.display} {rankLabel(cell.rank)}: {cell.gone} of {cell.total} discarded"
        >
          {cell.gone}/{cell.total}
        </div>
      {/each}
    {/each}
  </div>

  <p class="muted small legend">
    <span class="swatch critical"></span> last copy in play ·
    <span class="swatch dead"></span> all copies gone
  </p>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 28px repeat(var(--cols), 1fr);
    gap: 4px;
  }

  .suit {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    border-radius: 6px;
    background: var(--panel-2);
    border: 1px solid var(--line);
    font-size: 0.7rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .cell.none {
    color: var(--muted);
    opacity: 0.55;
  }

  .cell.critical {
    border-color: var(--warn);
    color: var(--warn);
  }

  .cell.dead {
    border-color: var(--danger);
    color: var(--danger);
    text-decoration: line-through;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }

  .swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 4px;
    border: 1px solid var(--line);
  }

  .swatch.critical {
    border-color: var(--warn);
  }

  .swatch.dead {
    border-color: var(--danger);
  }
</style>
