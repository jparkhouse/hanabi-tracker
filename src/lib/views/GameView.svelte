<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { app } from "../state/app.svelte";
  import {
    canDiscard,
    canGiveClue,
    identityStatus,
    isCritical,
    stateOf,
    type IdentityStatus,
  } from "../hanabi/engine";
  import { countsForCorrection, possibleIdentities, unseenCounts } from "../hanabi/deduce";
  import {
    endGame,
    recordClue,
    recordDiscard,
    recordPlay,
    rename,
    revealCard,
    setNote,
    setupComplete,
    undo,
  } from "../hanabi/recording";
  import { isKnown, type GameRecord, type Identity } from "../hanabi/types";
  import { identityName } from "../hanabi/variants";
  import CardFace from "../ui/CardFace.svelte";
  import IdentityPicker from "../ui/IdentityPicker.svelte";
  import Sheet from "../ui/Sheet.svelte";
  import CardInsight from "../game/CardInsight.svelte";
  import ClueSheet from "../game/ClueSheet.svelte";
  import DealPanel from "../game/DealPanel.svelte";
  import DiscardPanel from "../game/DiscardPanel.svelte";
  import HandRow from "../game/HandRow.svelte";
  import HistoryPanel from "../game/HistoryPanel.svelte";
  import StatusStrip from "../game/StatusStrip.svelte";

  interface Props {
    record: GameRecord;
    /**
     * The three props below exist for the bot build at `/bot/` and are never
     * passed by the plain tracker, which renders exactly as it always has.
     */
    botNotes?: Record<number, string>;
    /** Panel rendered between the board and the action bar. */
    aside?: Snippet;
    /** Extra section inside a card's detail sheet, given the card's order. */
    cardAside?: Snippet<[number]>;
  }

  let { record, botNotes, aside, cardAside }: Props = $props();

  type Move = "play" | "discard";
  type Pending =
    | { kind: "idle" }
    | { kind: "select"; move: Move }
    | { kind: "reveal"; move: Move; order: number }
    | { kind: "draw"; move: Move; order: number; reveal?: Identity }
    | { kind: "clue" };

  /** Dims a hand entirely while another seat's card is being picked. */
  const NO_CARDS: Set<number> = new Set();

  const statusWording: Record<IdentityStatus, string> = {
    playable: "playable right now",
    played: "already played — trash",
    dead: "can never be played — trash",
    later: "needed later",
  };

  let pending = $state<Pending>({ kind: "idle" });
  let menuOpen = $state(false);
  let detailOrder = $state<number | undefined>(undefined);
  /** A card being corrected because it was recorded wrongly. */
  let fixingOrder = $state<number | undefined>(undefined);
  let renaming = $state<string | undefined>(undefined);

  // Resuming a game skips the deal screen; a fresh one waits for a confirming tap
  // so the hands can be checked before the first turn.
  let dealConfirmed = $state(untrack(() => setupComplete(record)));
  let dealing = $derived(!setupComplete(record) || !dealConfirmed);
  let game = $derived(stateOf(record));
  let clueBlockedReason = $derived(
    canGiveClue(game)
      ? undefined
      : game.clueTokens < 1
        ? "No clue tokens left"
        : `Alternating Clues: the last clue was a ${
            game.lastClueKind === "color" ? "colour" : "rank"
          }, so this one must be the other`,
  );
  let counts = $derived(unseenCounts(game));
  let possibilities = $derived.by(() => {
    const map = new Map<number, Identity[]>();
    for (const card of game.cards) {
      if (card && !isKnown(card.identity)) {
        map.set(card.order, possibleIdentities(game, card.order, counts));
      }
    }
    return map;
  });

  // The card being corrected must not rule itself out of its own picker.
  let correctionCounts = $derived(
    fixingOrder === undefined ? counts : countsForCorrection(game, fixingOrder),
  );

  let actorHand = $derived(game.hands[game.currentPlayerIndex] ?? []);
  let selectable = $derived(pending.kind === "select" ? new Set(actorHand) : undefined);
  let actorName = $derived(game.players[game.currentPlayerIndex]);
  let drawerIsUs = $derived(game.currentPlayerIndex === game.ourPlayerIndex);

  function save(next: GameRecord) {
    app.put(next);
  }

  function chooseCard(order: number) {
    if (pending.kind !== "select") return;
    const card = game.cards[order];
    if (!card) return;
    if (!isKnown(card.identity)) {
      // Our own card: playing or discarding it turns it face up, so name it now.
      pending = { kind: "reveal", move: pending.move, order };
      return;
    }
    afterIdentity(pending.move, order, undefined);
  }

  function afterIdentity(move: Move, order: number, reveal: Identity | undefined) {
    // A replacement is drawn unless the deck is out; we can only name it for
    // someone else's hand.
    if (game.cardsRemaining > 0 && !drawerIsUs) {
      pending = { kind: "draw", move, order, reveal };
      return;
    }
    commit(move, order, reveal, undefined);
  }

  function commit(move: Move, order: number, reveal?: Identity, drawn?: Identity) {
    const input = { order, reveal, drawn };
    save(move === "play" ? recordPlay(record, input) : recordDiscard(record, input));
    pending = { kind: "idle" };
  }

  function onClue(target: number, clue: Parameters<typeof recordClue>[2], touched: number[]) {
    save(recordClue(record, target, clue, target === record.ourPlayerIndex ? touched : undefined));
    pending = { kind: "idle" };
  }

  function undoLast() {
    if (record.actions.length === 0) return;
    const last = game.log.at(-1);
    save(undo(record));
    pending = { kind: "idle" };
    app.toast(last ? `Undid: ${last.text}` : "Undid the last action.");
  }
</script>

<header class="topbar">
  <button class="icon-btn" aria-label="Back" onclick={() => app.go({ name: "home" })}>‹</button>
  <h1>{record.title}</h1>
  {#if !dealing}
    <button
      class="icon-btn"
      aria-label="Undo last action"
      onclick={undoLast}
      disabled={record.actions.length === 0}>↶</button
    >
  {/if}
  <button class="icon-btn" aria-label="More" onclick={() => (menuOpen = true)}>⋯</button>
</header>

{#if dealing}
  <DealPanel
    {record}
    onchange={save}
    onready={() => {
      dealConfirmed = true;
      app.toast(`${record.players[0]} starts.`);
    }}
  />
{:else}
  <div class="body">
    <StatusStrip {game} />

    {#if game.finished}
      <div class="card-panel done">
        <h2>Game over · {game.score}/{game.maxScore}</h2>
        <button class="btn btn-primary" onclick={() => app.go({ name: "review", id: record.id })}>
          Review &amp; export
        </button>
      </div>
    {/if}

    {#each game.players as _player, playerIndex (playerIndex)}
      <HandRow
        {game}
        {playerIndex}
        notes={record.notes}
        {possibilities}
        selectable={pending.kind === "select"
          ? playerIndex === game.currentPlayerIndex
            ? selectable
            : NO_CARDS
          : undefined}
        onselect={pending.kind === "select"
          ? playerIndex === game.currentPlayerIndex
            ? chooseCard
            : undefined
          : (order) => (detailOrder = order)}
        hint={pending.kind === "select" && playerIndex === game.currentPlayerIndex
          ? `tap the card ${actorName} ${pending.move === "play" ? "played" : "discarded"}`
          : undefined}
        {botNotes}
      />
    {/each}

    {@render aside?.()}

    <DiscardPanel {game} />
    <HistoryPanel {game} />
  </div>

  <div class="footer">
    {#if pending.kind === "select"}
      <div class="row">
        <span class="muted small grow">
          Tap {actorName}'s {pending.move === "play" ? "played" : "discarded"} card.
        </span>
        <button class="btn" onclick={() => (pending = { kind: "idle" })}>Cancel</button>
      </div>
    {:else if game.finished}
      <button class="btn btn-primary btn-block" onclick={() => app.go({ name: "review", id: record.id })}>
        Review &amp; export
      </button>
    {:else}
      <div class="actions">
        <button class="btn" onclick={() => (pending = { kind: "select", move: "play" })}>Play</button>
        <button
          class="btn"
          disabled={!canDiscard(game)}
          title={canDiscard(game) ? undefined : "No discarding at 8 clues"}
          onclick={() => (pending = { kind: "select", move: "discard" })}>Discard</button
        >
        <button
          class="btn btn-primary"
          disabled={!canGiveClue(game)}
          title={clueBlockedReason}
          onclick={() => (pending = { kind: "clue" })}>Clue</button
        >
      </div>
    {/if}
  </div>
{/if}

{#if pending.kind === "reveal"}
  {@const target = pending}
  <IdentityPicker
    variant={game.variant}
    title="What was it?"
    subtitle="Your card is face up now — name it so the export is complete."
    allowed={possibilities.get(target.order)}
    {counts}
    onpick={(identity) => afterIdentity(target.move, target.order, identity)}
    onclose={() => (pending = { kind: "select", move: target.move })}
  />
{/if}

{#if pending.kind === "draw"}
  {@const target = pending}
  <IdentityPicker
    variant={game.variant}
    title="{actorName} draws"
    subtitle="The new card goes into slot 1."
    {counts}
    onpick={(identity) => commit(target.move, target.order, target.reveal, identity)}
    onclose={() => (pending = { kind: "select", move: target.move })}
  />
{/if}

{#if pending.kind === "clue"}
  <ClueSheet {game} onconfirm={onClue} onclose={() => (pending = { kind: "idle" })} />
{/if}

{#if detailOrder !== undefined}
  {@const order = detailOrder}
  {@const card = game.cards[order]}
  {@const maybe = possibilities.get(order) ?? []}
  <Sheet
    title="{game.players[card.holder] ?? 'Card'} · slot {card.slot}"
    onclose={() => (detailOrder = undefined)}
  >
    <div class="detail">
      <CardFace
        variant={game.variant}
        identity={card.identity}
        knowledge={card.knowledge}
        possibilities={maybe}
        size="lg"
      />
      <div class="stack grow">
        {#if isKnown(card.identity)}
          <p class="small muted">It is really</p>
          <p><strong>{identityName(game.variant, card.identity)}</strong></p>
          <p class="small muted">
            {statusWording[identityStatus(game, card.identity)]}{isCritical(game, card.identity)
              ? " · last copy"
              : ""}
          </p>
        {:else}
          <p class="small muted">Yours, so you have never seen it.</p>
        {/if}
      </div>
    </div>

    <CardInsight {game} {order} />

    {@render cardAside?.(order)}

    <label class="stack">
      <span class="small muted">Note (exported with the game)</span>
      <textarea
        rows="2"
        value={record.notes[order] ?? ""}
        oninput={(event) => save(setNote(record, order, event.currentTarget.value))}
      ></textarea>
    </label>

    {#if isKnown(card.identity)}
      <button
        class="btn btn-block"
        onclick={() => {
          // `order` is derived from detailOrder, so read it before clearing that.
          fixingOrder = order;
          detailOrder = undefined;
        }}
      >
        Wrong card? Change it
      </button>
      <p class="muted small">
        Changing a card replays the rest of the game from it, so the stacks, strikes and score
        follow. Nothing else you have recorded is lost.
      </p>
    {/if}
  </Sheet>
{/if}

{#if fixingOrder !== undefined}
  {@const order = fixingOrder}
  {@const card = game.cards[order]}
  <IdentityPicker
    variant={game.variant}
    title="What is this card really?"
    subtitle="{game.players[card.holder] ?? 'This card'}{card.holder >= 0
      ? ` · slot ${card.slot}`
      : card.location === 'played'
        ? ' · played'
        : ' · discarded'} — recorded as {identityName(game.variant, card.identity)}."
    counts={correctionCounts}
    onpick={(identity) => {
      save(revealCard(record, order, identity));
      fixingOrder = undefined;
      app.toast(`Changed to ${identityName(game.variant, identity)}.`);
    }}
    onclose={() => (fixingOrder = undefined)}
  />
{/if}

{#if menuOpen}
  <Sheet title={record.title} subtitle={`${record.players.join(", ")} · ${record.variantName}`} onclose={() => (menuOpen = false)}>
    <button
      class="btn btn-block"
      onclick={() => {
        menuOpen = false;
        app.go({ name: "review", id: record.id });
      }}>Review &amp; export</button
    >
    <button class="btn btn-block" onclick={() => { renaming = record.title; menuOpen = false; }}>
      Rename
    </button>
    {#if record.actions.length === 0}
      <button
        class="btn btn-block"
        onclick={() => {
          dealConfirmed = false;
          menuOpen = false;
        }}>Edit the starting hands</button
      >
    {/if}
    {#if !game.finished}
      <button
        class="btn btn-block btn-danger"
        onclick={() => {
          save(endGame(record));
          menuOpen = false;
          app.toast("Game ended.");
        }}>End the game now</button
      >
    {/if}
    <p class="muted small">
      Everything is saved on this device as you tap. Undo removes the last action, including the
      card drawn with it.
    </p>
  </Sheet>
{/if}

{#if renaming !== undefined}
  <Sheet title="Rename" onclose={() => (renaming = undefined)}>
    <input bind:value={renaming} placeholder="Game name" />
    {#snippet footer()}
      <button class="btn btn-block" onclick={() => (renaming = undefined)}>Cancel</button>
      <button
        class="btn btn-primary btn-block"
        onclick={() => {
          if (renaming !== undefined) save(rename(record, renaming));
          renaming = undefined;
        }}>Save</button
      >
    {/snippet}
  </Sheet>
{/if}

<style>
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr 1.2fr;
    gap: 8px;
  }

  .actions .btn {
    min-height: 52px;
    font-size: 1rem;
  }

  .grow {
    flex: 1;
    min-width: 0;
  }

  .done {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-color: var(--good);
  }

  .detail {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
</style>
