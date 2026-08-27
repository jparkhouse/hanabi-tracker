<script lang="ts">
  import { app } from "../state/app.svelte";
  import { createGame } from "../hanabi/recording";
  import { handSize, MAX_PLAYERS, MIN_PLAYERS } from "../hanabi/types";
  import {
    DEFAULT_VARIANT_NAME,
    getVariant,
    searchVariants,
    variantExists,
    variantNotes,
  } from "../hanabi/variants";
  import Sheet from "../ui/Sheet.svelte";

  // Pre-filled from the last table so a regular group starts in two taps.
  const remembered =
    app.settings.lastPlayers.length >= MIN_PLAYERS ? [...app.settings.lastPlayers] : ["", ""];

  let names = $state<string[]>(remembered);
  let ourIndex = $state(Math.min(app.settings.lastOurPlayerIndex, remembered.length - 1));
  let variantName = $state(
    variantExists(app.settings.lastVariantName) ? app.settings.lastVariantName : DEFAULT_VARIANT_NAME,
  );
  let deckPlays = $state(false);
  let emptyClues = $state(false);
  let variantOpen = $state(false);
  let variantQuery = $state("");

  let trimmed = $derived(names.map((name) => name.trim()));
  let duplicate = $derived(
    new Set(trimmed.filter(Boolean).map((n) => n.toLowerCase())).size !==
      trimmed.filter(Boolean).length,
  );
  let ready = $derived(
    trimmed.length >= MIN_PLAYERS && trimmed.every((name) => name !== "") && !duplicate,
  );
  let variant = $derived(getVariant(variantName));
  let notes = $derived(variantNotes(variant));
  let results = $derived(searchVariants(variantQuery));

  function addPlayer() {
    if (names.length >= MAX_PLAYERS) return;
    names = [...names, ""];
  }

  function removePlayer(index: number) {
    if (names.length <= MIN_PLAYERS) return;
    names = names.filter((_, i) => i !== index);
    if (ourIndex >= names.length) ourIndex = names.length - 1;
    else if (ourIndex > index) ourIndex--;
  }

  function move(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= names.length) return;
    const next = [...names];
    [next[index], next[to]] = [next[to], next[index]];
    names = next;
    if (ourIndex === index) ourIndex = to;
    else if (ourIndex === to) ourIndex = index;
  }

  function start() {
    if (!ready) return;
    try {
      const record = createGame({
        players: trimmed,
        ourPlayerIndex: ourIndex,
        variantName,
        options: { deckPlays, emptyClues },
      });
      app.put(record);
      app.updateSettings({
        lastPlayers: trimmed,
        lastOurPlayerIndex: ourIndex,
        lastVariantName: variantName,
      });
      app.go({ name: "game", id: record.id });
    } catch (error) {
      app.toast(error instanceof Error ? error.message : "Could not start the game.", "error");
    }
  }
</script>

<header class="topbar">
  <button class="icon-btn" aria-label="Back" onclick={() => app.go({ name: "home" })}>‹</button>
  <h1>New game</h1>
</header>

<div class="body">
  <section class="card-panel stack">
    <div class="spread">
      <h3>Players in turn order</h3>
      <span class="muted small">{names.length} · {handSize(names.length)} cards each</span>
    </div>
    <p class="muted small">
      List everyone starting with whoever takes the first turn, then pick your own seat — that hand
      stays face down.
    </p>

    <ul class="players">
      {#each names as _name, index (index)}
        <li>
          <button
            class="seat"
            class:me={ourIndex === index}
            aria-pressed={ourIndex === index}
            onclick={() => (ourIndex = index)}
            title="This is me"
          >
            {ourIndex === index ? "You" : index + 1}
          </button>
          <input
            placeholder="Player {index + 1}"
            bind:value={names[index]}
            autocomplete="off"
            autocapitalize="words"
            spellcheck="false"
          />
          <button class="icon-btn" aria-label="Move up" onclick={() => move(index, -1)} disabled={index === 0}>↑</button>
          <button
            class="icon-btn"
            aria-label="Move down"
            onclick={() => move(index, 1)}
            disabled={index === names.length - 1}>↓</button
          >
          <button
            class="icon-btn"
            aria-label="Remove"
            onclick={() => removePlayer(index)}
            disabled={names.length <= MIN_PLAYERS}>✕</button
          >
        </li>
      {/each}
    </ul>

    <button class="btn btn-block" onclick={addPlayer} disabled={names.length >= MAX_PLAYERS}>
      Add player
    </button>
    {#if duplicate}
      <p class="small danger">Two players share a name — hanab.live needs them distinct.</p>
    {/if}
  </section>

  <section class="card-panel stack">
    <h3>Variant</h3>
    <button class="btn btn-block variant" onclick={() => (variantOpen = true)}>
      <span>{variantName}</span>
      <span class="muted small">{variant.suits.length} suits · {variant.totalCards} cards</span>
    </button>
    {#if notes.length > 0}
      <ul class="notes muted small">
        {#each notes as note (note)}
          <li>{note}</li>
        {/each}
      </ul>
    {/if}
    <div class="swatches">
      {#each variant.suits as suit (suit.name)}
        <span
          class="swatch"
          style:background={suit.fill.length === 1
            ? suit.fill[0]
            : `linear-gradient(150deg, ${suit.fill.join(", ")})`}
          title={suit.display}
        ></span>
      {/each}
    </div>
  </section>

  <details class="card-panel">
    <summary>House rules</summary>
    <label class="check">
      <input type="checkbox" bind:checked={deckPlays} />
      <span>Deck plays — the final card may be played blind</span>
    </label>
    <label class="check">
      <input type="checkbox" bind:checked={emptyClues} />
      <span>Empty clues allowed</span>
    </label>
  </details>
</div>

<div class="footer">
  <button class="btn btn-primary btn-block" onclick={start} disabled={!ready}>
    Deal
  </button>
</div>

{#if variantOpen}
  <Sheet
    title="Variant"
    subtitle="Named exactly as hanab.live does, so exports import cleanly."
    onclose={() => (variantOpen = false)}
  >
    <input
      placeholder="Search variants…"
      bind:value={variantQuery}
      autocomplete="off"
      spellcheck="false"
    />
    <ul class="variants">
      {#each results as name (name)}
        <li>
          <button
            class="variant-row"
            class:current={name === variantName}
            onclick={() => {
              variantName = name;
              variantOpen = false;
            }}
          >
            <span>{name}</span>
            <span class="swatches small-swatches">
              {#each getVariant(name).suits as suit (suit.name)}
                <span
                  class="swatch"
                  style:background={suit.fill.length === 1
                    ? suit.fill[0]
                    : `linear-gradient(150deg, ${suit.fill.join(", ")})`}
                ></span>
              {/each}
            </span>
          </button>
        </li>
      {:else}
        <li class="muted small">No variant matches that.</li>
      {/each}
    </ul>
  </Sheet>
{/if}

<style>
  .players {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .players li {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .seat {
    flex: none;
    width: 46px;
    height: var(--tap);
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--panel-2);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--muted);
  }

  .seat.me {
    background: var(--accent);
    color: var(--accent-ink);
    border-color: transparent;
  }

  .danger {
    color: var(--danger);
  }

  .variant {
    justify-content: space-between;
    text-align: left;
  }

  .notes {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 2px;
  }

  .swatches {
    display: flex;
    gap: 6px;
  }

  .swatch {
    width: 22px;
    height: 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .small-swatches .swatch {
    width: 14px;
    height: 10px;
  }

  details summary {
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    font-size: 0.9rem;
  }

  .check input {
    width: 22px;
    height: 22px;
    min-height: 0;
    flex: none;
  }

  .variants {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .variant-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: var(--tap);
    padding: 8px 12px;
    border-radius: 10px;
    background: var(--panel-2);
    border: 1px solid var(--line);
    text-align: left;
  }

  .variant-row.current {
    border-color: var(--accent);
  }
</style>
