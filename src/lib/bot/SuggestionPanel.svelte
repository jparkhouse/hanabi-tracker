<script lang="ts">
  import type { GameRecord } from "../hanabi/types";
  import type { BotAnalysis } from "./hgroup";
  import { isOurTurn, suggestMoves, type Suggestion } from "./suggest";
  import { conventionName } from "./conventions";

  interface Props {
    record: GameRecord;
    analysis: BotAnalysis;
  }

  let { record, analysis }: Props = $props();

  let open = $state(true);
  let expanded = $state<number | undefined>(undefined);

  let game = $derived(analysis.state);
  let ours = $derived(isOurTurn(game));
  let actor = $derived(game.players[game.currentPlayerIndex]);

  // Scoring every legal clue is the expensive part, so only do it when the
  // panel is open and it is actually a turn worth advising on.
  let suggestions = $derived.by<Suggestion[]>(() => {
    if (!open || game.finished || analysis.unsupported) return [];
    return suggestMoves(record, analysis).slice(0, 6);
  });

  let best = $derived(suggestions[0]);
</script>

<section class="card-panel bot" aria-label="Bot suggestions">
  <div class="head">
    <h2>
      <span class="tag">bot</span>
      {#if game.finished}
        Game over
      {:else if ours}
        Your turn
      {:else}
        {actor}'s turn
      {/if}
    </h2>
    <button class="link" onclick={() => (open = !open)}>{open ? "hide" : "show"}</button>
  </div>

  {#if open}
    {#if analysis.unsupported}
      <p class="small muted">
        Conventions are off for <strong>{game.variant.name}</strong> — {analysis.unsupported}, and
        H-Group does not describe that. The tracker underneath is recording the game as usual;
        only the notes and suggestions are withheld.
      </p>
    {:else if game.finished}
      <p class="small muted">Nothing left to suggest.</p>
    {:else if suggestions.length === 0}
      <p class="small muted">No move to suggest here.</p>
    {:else}
      {#if !ours}
        <p class="small muted">
          Not your turn — this is what the bot would do in {actor}'s seat, which it can only
          guess at, since it cannot see their cards the way they do.
        </p>
      {/if}

      <ol class="moves">
        {#each suggestions as suggestion, index (suggestion.label + index)}
          <li>
            <button
              class="move"
              class:top={index === 0}
              class:risky={suggestion.risky}
              onclick={() => (expanded = expanded === index ? undefined : index)}
              aria-expanded={expanded === index}
            >
              <span class="value">{suggestion.value.toFixed(2)}</span>
              <span class="what">
                <strong>{suggestion.label}</strong>
                <span class="small muted">{suggestion.detail}</span>
              </span>
              <span class="chev">{expanded === index ? "▾" : "▸"}</span>
            </button>
            {#if expanded === index}
              <ul class="why">
                {#each suggestion.reasons as reason (reason)}
                  <li class="small muted">{reason}</li>
                {/each}
              </ul>
            {/if}
          </li>
        {/each}
      </ol>

      {#if best}
        <p class="small muted">
          Values are expected points, one move deep — a clue whose payoff is two turns out is
          undersold. Tap a move for the arithmetic. Playing by {conventionName(analysis.settings)}.
        </p>
      {/if}
    {/if}
  {/if}
</section>

<style>
  .bot {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .head h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    margin: 0;
  }

  .tag {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
    border-radius: 999px;
    padding: 1px 7px;
  }

  .link {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 0.8rem;
    padding: 4px;
    cursor: pointer;
  }

  .moves {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .move {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    background: var(--panel-3);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 8px 10px;
    color: inherit;
    cursor: pointer;
  }

  .move.top {
    border-color: var(--good);
    background: color-mix(in srgb, var(--good) 10%, var(--panel-3));
  }

  .move.risky {
    border-color: var(--warn);
  }

  .value {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-weight: 700;
    font-size: 0.95rem;
    min-width: 3.2em;
    text-align: right;
  }

  .what {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .chev {
    color: var(--muted);
  }

  .why {
    list-style: none;
    margin: 4px 0 0;
    padding: 0 0 0 calc(3.2em + 20px);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
</style>
