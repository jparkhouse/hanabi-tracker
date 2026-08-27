<script lang="ts">
  import { allowedClueKinds, previewClue, type GameState } from "../hanabi/engine";
  import type { Clue, ClueKind } from "../hanabi/types";
  import { clueName, clueValueIsPublic } from "../hanabi/variants";
  import { inkOn } from "../ui/colors";
  import Sheet from "../ui/Sheet.svelte";
  import HandRow from "./HandRow.svelte";

  interface Props {
    game: GameState;
    onconfirm: (target: number, clue: Clue, touched: number[]) => void;
    onclose: () => void;
  }

  let { game, onconfirm, onclose }: Props = $props();

  let others = $derived(
    game.players.map((_, index) => index).filter((index) => index !== game.currentPlayerIndex),
  );
  // Until a seat is tapped, aim at the next player round — the common case.
  let chosenTarget = $state<number | undefined>(undefined);
  let target = $derived(chosenTarget ?? (game.currentPlayerIndex + 1) % game.players.length);
  let clue = $state<Clue | undefined>(undefined);
  /** Only used when cluing our own hand, where nothing can be derived. */
  let manualTouched = $state<Set<number>>(new Set());

  let cluingUs = $derived(target === game.ourPlayerIndex);
  // Alternating Clues bars whichever kind was given last; the Mute and Blind
  // variants remove one for the whole game.
  let allowed = $derived(allowedClueKinds(game));
  let barred = $derived(
    game.variant.rules.alternatingClues && game.lastClueKind !== null
      ? game.lastClueKind
      : undefined,
  );
  // Under Cow & Pig and Duck the giver still picks a real clue; only the word
  // they are allowed to say for it changes.
  let spoken = $derived(clue && !clueValueIsPublic(game.variant) ? clueName(game.variant, clue) : undefined);

  function offers(kind: ClueKind) {
    return allowed.includes(kind);
  }
  let touched = $derived(
    clue === undefined
      ? []
      : cluingUs
        ? (game.hands[target] ?? []).filter((order) => manualTouched.has(order))
        : previewClue(game, target, clue),
  );
  let touchesNothing = $derived(clue !== undefined && touched.length === 0);
  // Aimed at our own hand, an empty selection only means "not tapped yet", so
  // say nothing; aimed anywhere else it is a real dead clue.
  let empty = $derived(touchesNothing && !cluingUs);
  let canConfirm = $derived(
    clue !== undefined && (!touchesNothing || game.options.emptyClues),
  );

  function selectTarget(index: number) {
    chosenTarget = index;
    manualTouched = new Set();
  }

  function toggle(order: number) {
    const next = new Set(manualTouched);
    if (next.has(order)) next.delete(order);
    else next.add(order);
    manualTouched = next;
  }
</script>

<Sheet
  title="Give a clue"
  subtitle="{game.players[game.currentPlayerIndex]} is cluing"
  {onclose}
>
  <div class="stack">
    <h3>To</h3>
    <div class="chips">
      {#each others as index (index)}
        <button
          class="chip"
          class:on={target === index}
          aria-pressed={target === index}
          onclick={() => selectTarget(index)}
        >
          {game.players[index]}{index === game.ourPlayerIndex ? " (you)" : ""}
        </button>
      {/each}
    </div>
  </div>

  {#if game.variant.clueColors.length > 0}
    <div class="stack">
      <h3>Colour</h3>
      <div class="clue-grid">
        {#each game.variant.clueColors as color, value (color.name)}
          <button
            class="clue"
            class:on={clue?.kind === "color" && clue.value === value}
            style:background={color.fill}
            style:color={inkOn([color.fill])}
            disabled={!offers("color")}
            onclick={() => (clue = { kind: "color", value })}
          >
            {color.name}
          </button>
        {/each}
      </div>
      {#if barred === "color"}
        <p class="muted small">Last clue was a colour, so this one must be a rank.</p>
      {/if}
    </div>
  {/if}

  {#if game.variant.clueRanks.length > 0}
    <div class="stack">
      <h3>{game.variant.rules.oddsAndEvens ? "Parity" : "Rank"}</h3>
      <div class="clue-grid ranks">
        {#each game.variant.clueRanks as rank (rank)}
          <button
            class="clue rank"
            class:on={clue?.kind === "rank" && clue.value === rank}
            disabled={!offers("rank")}
            onclick={() => (clue = { kind: "rank", value: rank })}
          >
            {clueName(game.variant, { kind: "rank", value: rank })}
          </button>
        {/each}
      </div>
      {#if barred === "rank"}
        <p class="muted small">Last clue was a rank, so this one must be a colour.</p>
      {/if}
    </div>
  {/if}

  {#if spoken}
    <p class="muted small">
      All they hear is &ldquo;{spoken}&rdquo; — record which cards were pointed at, not the
      colour or number behind it.
    </p>
  {/if}

  <HandRow
    {game}
    playerIndex={target}
    highlight={new Set(touched)}
    selectable={cluingUs && clue !== undefined ? new Set(game.hands[target] ?? []) : undefined}
    onselect={cluingUs && clue !== undefined ? toggle : undefined}
    hint={cluingUs
      ? clue === undefined
        ? "pick the clue first"
        : "tap the cards they pointed at"
      : undefined}
  />

  {#if empty}
    <p class="small warn">
      That clue touches nothing.{game.options.emptyClues
        ? " Allowed by your house rules."
        : " Pick another, or enable empty clues in the game's settings."}
    </p>
  {/if}

  {#snippet footer()}
    <button class="btn btn-block" onclick={onclose}>Cancel</button>
    <button
      class="btn btn-primary btn-block"
      disabled={!canConfirm}
      onclick={() => clue && onconfirm(target, clue, touched)}
    >
      Record clue
    </button>
  {/snippet}
</Sheet>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    min-height: var(--tap);
    padding: 0 14px;
    border-radius: 999px;
    background: var(--panel-2);
    border: 1px solid var(--line);
    font-weight: 600;
  }

  .chip.on {
    background: var(--accent);
    color: var(--accent-ink);
    border-color: transparent;
  }

  .clue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(78px, 1fr));
    gap: 6px;
  }

  /* Sudoku offers four ranks and Odds and Evens two, so let them share the row. */
  .clue-grid.ranks {
    grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
  }

  .clue {
    min-height: 48px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-weight: 700;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  }

  .clue.rank {
    background: var(--panel-2);
    font-size: 1.2rem;
    text-shadow: none;
  }

  .clue.on {
    box-shadow: 0 0 0 3px var(--accent);
  }

  .clue:disabled {
    opacity: 0.35;
  }

  .warn {
    color: var(--warn);
  }
</style>
