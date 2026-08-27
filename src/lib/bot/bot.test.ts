/**
 * The bot reads a table the way scala-bot does, so these tests are written in
 * terms of the notes it writes: `[f] [r1]` for a card called to play, `kt` for
 * known trash, and so on. If a note here changes, the convention reading
 * changed with it.
 */
import { describe, expect, it } from "vitest";
import fixture from "../hanabi/fixtures/live-game-4p.json";
import { fromHanabLive } from "../hanabi/hanabLive";
import { ActionType, type GameAction, type GameRecord, type Identity } from "../hanabi/types";
import { DEFAULT_BOT_SETTINGS, missingTechniques, type BotSettings } from "./conventions";
import { analyse, unsupportedVariantReason } from "./hgroup";
import { getVariant } from "../hanabi/variants";
import { ordOf } from "./empathy";
import type { BotOverride, BotOverrides } from "./overrides";
import { botNote } from "./notes";
import { suggestMoves } from "./suggest";

const SETTINGS: BotSettings = { ...DEFAULT_BOT_SETTINGS, level: 5 };

const RED = 0;
const YELLOW = 1;
const GREEN = 2;
const BLUE = 3;

function id(suitIndex: number, rank: number): Identity {
  return { suitIndex, rank };
}

/**
 * A two-player game with a deck we control. Seat 0 is us (hand hidden from the
 * app's point of view), seat 1 is "bo"; orders 0-4 are ours, 5-9 are bo's, and
 * within each block the *last* order is slot 1.
 */
function game(deck: Identity[], actions: GameAction[] = []): GameRecord {
  return {
    id: "test",
    createdAt: 0,
    updatedAt: 0,
    title: "test",
    players: ["us", "bo"],
    ourPlayerIndex: 0,
    variantName: "No Variant",
    deck,
    actions,
    touchedByAction: {},
    notes: {},
    options: { deckPlays: false, emptyClues: false },
  };
}

/** Card corrections on their own, which is what most of these tests want. */
function cards(map: Record<number, BotOverride>): BotOverrides {
  return { cards: map, clues: {} };
}

const UNSEEN: Identity = { suitIndex: -1, rank: -1 };
const ourHand = Array.from({ length: 5 }, () => UNSEEN);

/** Filler for bo's hand that no clue in these tests touches. */
function bo(...cards: Identity[]): Identity[] {
  return cards;
}

describe("reading a clue", () => {
  it("calls a card playable and writes the note scala-bot would", () => {
    // bo's slot 1 (order 9) is r1; a red clue touches only it.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 1)),
        ...Array.from({ length: 10 }, () => id(GREEN, 5)),
      ],
      [{ type: ActionType.ColorClue, target: 1, value: RED }],
    );

    const analysis = analyse(record, SETTINGS);
    // Occam's razor: red on an empty stack means r1, not r2 off a finesse.
    expect(botNote(analysis, 9)).toBe("[f] [r1]");
  });

  it("reads a clue on the chop as a save and promises no play", () => {
    // Order 5 is bo's oldest card and his chop: a 5, so "5" saves it.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 5), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 4)),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [{ type: ActionType.RankClue, target: 1, value: 5 }],
    );

    const analysis = analyse(record, SETTINGS);
    const interp = analysis.interps.at(-1);
    expect(interp?.kind).toBe("save");
    expect(interp?.focus).toBe(5);
    // A save says "hold this", not "play this", so there is no [f] — but it is
    // a state of its own, not the same as carrying no instruction at all.
    expect(analysis.thoughts.get(5)?.status).toBe("saved");
    expect(botNote(analysis, 5)).not.toContain("[f]");
    expect(botNote(analysis, 5)).toContain("5");
  });

  it("finds the finesse that makes an unplayable card make sense", () => {
    // A rank clue cannot be read as "the playable one" the way a colour clue
    // can, so "2" on an empty board has to be explained. bo's slot 2 is g1 and
    // his slot 1 is g2: the 2 only plays if he blind-plays the 1 underneath.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 1), id(GREEN, 2)),
        ...Array.from({ length: 10 }, () => id(YELLOW, 3)),
      ],
      [{ type: ActionType.RankClue, target: 1, value: 2 }],
    );

    const analysis = analyse(record, SETTINGS);
    const interp = analysis.interps.at(-1);
    expect(interp?.kind).toBe("play");
    expect(interp?.connections.map((c) => c.kind)).toEqual(["finesse"]);
    // The 2 is pinned to green because that is the only 1 anyone can produce.
    expect(botNote(analysis, 9)).toBe("[f] [g2]");
    // And the card asked to blind-play says so, with nothing having touched it.
    expect(botNote(analysis, 8)).toBe("[f] [g1]");
  });

  it("connects through a card the table has already placed", () => {
    // The delayed play clue, and the thing the bot used to be unable to see at
    // all. Nothing red is playable when the "2" is given — r1 has not gone down
    // — but everyone knows bo is holding it, so r2 is a perfectly readable clue.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 1)),
        id(RED, 2),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [
        // Red on an empty board means r1: order 9 is now known to the table.
        { type: ActionType.ColorClue, target: 1, value: RED },
        // bo throws his chop away and draws the r2 (order 10).
        { type: ActionType.Discard, target: 5, value: 0 },
        { type: ActionType.RankClue, target: 1, value: 2 },
      ],
    );

    const analysis = analyse(record, SETTINGS);
    const interp = analysis.interps.at(-1);
    expect(interp?.kind).toBe("play");
    expect(interp?.focus).toBe(10);

    // One connection, and it costs nobody a blind play: bo already knows he
    // holds the r1, so the clue is simply "the one after it".
    expect(interp?.connections).toHaveLength(1);
    expect(interp?.connections[0].kind).toBe("known");
    expect(interp?.connections[0].order).toBe(9);
    expect(interp?.detail).toContain("known r1");

    // Red is the only suit anyone can reach, so the 2 is pinned to r2.
    expect(botNote(analysis, 10)).toBe("[f] [r2]");
  });

  it("does not read a colour clue on the chop as saving a 5", () => {
    // 5s are saved with "5", never with their colour. bo's chop is the b5, and
    // blue touches only it — so this is a play clue for b1, not a save. Reading
    // it as a save is how a bot tells you to sit on a playable card.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 5), id(GREEN, 4), id(YELLOW, 4), id(GREEN, 3), id(RED, 4)),
        ...Array.from({ length: 10 }, () => id(GREEN, 2)),
      ],
      [{ type: ActionType.ColorClue, target: 1, value: BLUE }],
    );

    const analysis = analyse(record, SETTINGS);
    const interp = analysis.interps.at(-1);
    expect(interp?.focus).toBe(5); // it is the chop
    expect(interp?.kind).toBe("play");
    expect(analysis.thoughts.get(5)?.status).toBe("called to play");
    expect(botNote(analysis, 5)).toBe("[f] [b1]");
  });

  it("reads a 5 clued one slot off the chop as a chop move", () => {
    // The 5's Chop Move. Two rules keep it from firing everywhere, and both are
    // exercised here: the early game has to be over, and the 5 has to be
    // *exactly* one card away from the chop.
    const record = game(
      [
        ...ourHand,
        ...bo(id(GREEN, 4), id(YELLOW, 4), id(BLUE, 4), id(RED, 5), id(YELLOW, 3)),
        id(GREEN, 2),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [
        { type: ActionType.ColorClue, target: 1, value: BLUE }, // touches b4 (order 7)
        { type: ActionType.Discard, target: 5, value: 0 }, // ends the early game
        { type: ActionType.RankClue, target: 1, value: 5 }, // touches r5 (order 8)
      ],
    );

    const analysis = analyse(record, SETTINGS);
    const interp = analysis.interps.at(-1);
    expect(interp?.kind).toBe("chop move");
    expect(interp?.detail).toContain("5 chop move");
    // The card kept is the chop, not the 5 that was clued.
    expect(analysis.thoughts.get(6)?.status).toBe("chop moved");
    expect(botNote(analysis, 6)).toContain("[cm]");
  });

  it("focuses the oldest 1 when a rank-1 clue catches several", () => {
    // 1s are played oldest-first out of the starting hand, so a "1" touching
    // two of them is pointing at the older one. Taking the newest instead — the
    // ordinary focus rule — puts the note on the wrong card.
    const record = game(
      [
        ...ourHand,
        ...bo(id(GREEN, 4), id(RED, 1), id(YELLOW, 4), id(BLUE, 1), id(GREEN, 3)),
        ...Array.from({ length: 10 }, () => id(GREEN, 2)),
      ],
      [{ type: ActionType.RankClue, target: 1, value: 1 }],
    );

    const analysis = analyse(record, SETTINGS);
    expect(analysis.interps.at(-1)?.focus).toBe(6);
  });

  it("drops played identities from a card's note under Good Touch", () => {
    // Two red 1s in bo's hand, both clued as 1s; he plays one. The other is
    // still clued as a 1, and Good Touch says a touched card is not trash, so
    // r1 drops out of its note even though a third copy exists.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(RED, 1), id(RED, 1)),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [
        { type: ActionType.RankClue, target: 1, value: 1 },
        { type: ActionType.Play, target: 9, value: 0 }, // bo plays r1
      ],
    );

    const analysis = analyse(record, SETTINGS);
    const note = botNote(analysis, 8);
    expect(note).not.toContain("r1");
    expect(note).toContain("y1");

    // With Good Touch off, r1 comes back: nothing rules it out by counting.
    const loose = analyse(record, { ...SETTINGS, goodTouch: false });
    expect(botNote(loose, 8)).toContain("r1");
  });
});

describe("reading a clue in the light of later turns", () => {
  /**
   * A rank-2 clue on bo's slot 1 (g2) only makes sense as a finesse: he has to
   * blind-play the g1 in slot 2 first. That is the reading — until it isn't.
   */
  function finesseGame() {
    return game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 1), id(GREEN, 2)),
        ...Array.from({ length: 10 }, () => id(YELLOW, 3)),
      ],
      [{ type: ActionType.RankClue, target: 1, value: 2 }],
    );
  }

  it("waits on the blind play a finesse asks for", () => {
    const analysis = analyse(finesseGame(), SETTINGS);
    expect(analysis.waiting).toHaveLength(1);
    const link = analysis.waiting[0].connections[analysis.waiting[0].index];
    expect(link.kind).toBe("finesse");
    expect(link.order).toBe(8); // bo's slot 2, the g1
  });

  it("drops the reading when the blind play never comes", () => {
    const record = finesseGame();
    expect(botNote(analyse(record, SETTINGS), 9)).toBe("[f] [g2]");

    // bo discards instead of blind-playing, so the finesse was never there.
    record.actions.push({ type: ActionType.Discard, target: 5, value: 0 });
    const after = analyse(record, SETTINGS);

    expect(after.reinterpretations).toHaveLength(1);
    expect(after.reinterpretations[0].reason).toContain("discarded");
    expect(after.interps.at(-1)?.ruledOut).toContain(GREEN * 5 + 1); // g2 struck out

    // With its only reading gone, the clue no longer promises anything, and the
    // card it had asked to blind-play stops claiming to be a g1.
    expect(after.interps.at(-1)?.kind).toBe("unclear");
    expect(botNote(after, 8)).not.toContain("[f]");
    expect(after.waiting).toHaveLength(0);
  });

  it("keeps the reading when the blind play does come", () => {
    const record = finesseGame();
    record.actions.push({ type: ActionType.Play, target: 8, value: 0 }); // bo blind-plays g1

    const after = analyse(record, SETTINGS);
    expect(after.reinterpretations).toHaveLength(0);
    expect(after.state.playStacks[GREEN]).toBe(1);
    expect(botNote(after, 9)).toBe("[f] [g2]");
  });

  it("reads a discard of a card everyone knew you held as sarcastic", () => {
    // bo is clued red on an empty board, so the table knows he holds r1.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(GREEN, 4), id(YELLOW, 4), id(RED, 1)),
        ...Array.from({ length: 12 }, () => id(GREEN, 3)),
      ],
      [
        { type: ActionType.ColorClue, target: 1, value: RED },
        { type: ActionType.RankClue, target: 0, value: 1 }, // bo clues our slot 1
        { type: ActionType.Discard, target: 0, value: 0 }, // us, passing the turn back
        { type: ActionType.Discard, target: 9, value: 0 }, // bo throws away the known r1
      ],
    );
    record.touchedByAction = { 1: [4] };

    const analysis = analyse(record, SETTINGS);
    expect(analysis.discards).toHaveLength(1);
    expect(analysis.discards[0].kind).toBe("sarcastic");
    expect(analysis.discards[0].orders).toEqual([4]);

    // Throwing it away said where the other one is: our clued 1 is the r1.
    expect(botNote(analysis, 4)).toBe("[f] [r1]");
  });
});

describe("choosing between readings", () => {
  /**
   * Red is at 1 and bo holds g1 behind a g2. A rank-2 clue on the g2 has two
   * readings: r2, which plays right now, and g2, which needs the blind play.
   * Occam's razor takes the cheap one.
   */
  function twoReadings() {
    return game(
      [
        // Our own slot 1 is an r1 we play ourselves, which puts red on 1 without
        // giving bo's hand any negative-red information to reason from.
        UNSEEN,
        UNSEEN,
        UNSEEN,
        UNSEEN,
        id(RED, 1),
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 1), id(GREEN, 2)),
        ...Array.from({ length: 10 }, () => id(YELLOW, 4)),
      ],
      [
        { type: ActionType.Play, target: 4, value: 0 }, // us: red is at 1
        { type: ActionType.RankClue, target: 0, value: 5 }, // bo: touches nothing, passes the turn
        { type: ActionType.RankClue, target: 1, value: 2 },
      ],
    );
  }

  it("keeps the readings it rejected, not just the one it took", () => {
    const analysis = analyse(twoReadings(), SETTINGS);
    const interp = analysis.interps.at(-1)!;

    expect(interp.chosen).toEqual([RED * 5 + 1]); // r2, no work needed
    const offered = interp.alternatives.map((fp) => fp.identity);
    expect(offered).toContain(GREEN * 5 + 1); // g2, off the finesse
    expect(interp.alternatives.find((fp) => fp.identity === GREEN * 5 + 1)?.connections).toHaveLength(
      1,
    );
  });

  it("takes the reading you pick over the one it preferred", () => {
    const record = twoReadings();
    expect(botNote(analyse(record, SETTINGS), 9)).toBe("[f] [r2]");

    const corrected = analyse(record, SETTINGS, {
      cards: {},
      clues: { 2: { identity: GREEN * 5 + 1 } },
    });

    expect(botNote(corrected, 9)).toBe("[f] [g2]");
    // And the blind play it implies is written onto the card behind it.
    expect(botNote(corrected, 8)).toBe("[f] [g1]");
    expect(corrected.interps.at(-1)?.overridden).toBe(true);
  });

  it("reads a blind play as playable-something once bluffs are on", () => {
    const record = twoReadings();
    const bluffs = analyse(record, { ...SETTINGS, level: 11 }, {
      cards: {},
      clues: { 2: { identity: GREEN * 5 + 1 } },
    });

    // At level 11 the blind play might be a bluff, so the card is known to be
    // playable without being known to be the g1 the clue pointed at. The rank-2
    // clue said it is not a 2, so what is left is every playable 1.
    const note = botNote(bluffs, 8);
    expect(note).toBe("[f] [y1,g1,b1,p1]");
    expect(bluffs.thoughts.get(8)?.bluffed).toBe(true);

    // At level 5 there are no bluffs, so the promise is taken at its word.
    expect(botNote(analyse(record, SETTINGS, { cards: {}, clues: { 2: { identity: GREEN * 5 + 1 } } }), 8)).toBe(
      "[f] [g1]",
    );
  });
});

describe("suggesting a move", () => {
  it("puts a certain play at the top, worth about a point", () => {
    // We are told "1" on our slot 1, which on an empty board is a play clue.
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 4)),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [
        { type: ActionType.RankClue, target: 1, value: 4 }, // us -> bo, passes the turn
        { type: ActionType.RankClue, target: 0, value: 1 }, // bo -> us
      ],
    );
    record.touchedByAction = { 1: [4] };

    const analysis = analyse(record, SETTINGS);
    const suggestions = suggestMoves(record, analysis);
    const best = suggestions[0];

    expect(best.move).toEqual({ kind: "play", order: 4 });
    expect(best.value).toBeGreaterThan(0.9);
    expect(best.risky).toBe(false);
    expect(best.reasons.join(" ")).toContain("certain to play");
  });

  it("scores a clue that sets up a play above one that touches nothing useful", () => {
    const record = game([
      ...ourHand,
      ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 1)),
      ...Array.from({ length: 10 }, () => id(GREEN, 3)),
    ]);

    const analysis = analyse(record, SETTINGS);
    const suggestions = suggestMoves(record, analysis);
    const red = suggestions.find(
      (s) => s.move.kind === "clue" && s.move.clue.kind === "color" && s.move.clue.value === RED,
    );
    const blue = suggestions.find(
      (s) => s.move.kind === "clue" && s.move.clue.kind === "color" && s.move.clue.value === BLUE,
    );

    expect(red).toBeDefined();
    expect(blue).toBeDefined();
    // Red sets up the playable r1; blue touches two cards that go nowhere yet.
    expect(red!.value).toBeGreaterThan(blue!.value);
    expect(red!.reasons.join(" ")).toContain("sets up r1");
  });

  it("prefers discarding known trash over the chop", () => {
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 1)),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [
        { type: ActionType.ColorClue, target: 1, value: RED },
        { type: ActionType.Play, target: 9, value: 0 }, // bo plays r1, red is at 1
        { type: ActionType.RankClue, target: 0, value: 1 }, // us: pointless, passes turn
        { type: ActionType.RankClue, target: 1, value: 1 },
      ],
    );

    const analysis = analyse(record, SETTINGS);
    const suggestions = suggestMoves(record, analysis);
    const discards = suggestions.filter((s) => s.move.kind === "discard");
    expect(discards.length).toBeGreaterThan(0);
    // Every discard reason should account for what it costs.
    for (const discard of discards) {
      expect(discard.reasons.join(" ")).toContain("clue token");
    }
  });
});

describe("running over a real game", () => {
  const record = fromHanabLive(fixture, { ourPlayerIndex: 0 });

  /** Who was to move when a given action was taken. */
  function giverOf(game: GameRecord, actionIndex: number): number {
    return analyse(game, SETTINGS, undefined, actionIndex).state.currentPlayerIndex;
  }

  it("reads all 4 players' hands without falling over", () => {
    const analysis = analyse(record, SETTINGS);
    expect(analysis.state.score).toBe(20);
    // Every clue got some reading, even if the reading is "unclear".
    const clues = record.actions.filter(
      (action) => action.type === ActionType.ColorClue || action.type === ActionType.RankClue,
    );
    expect(analysis.interps).toHaveLength(clues.length);
  });

  it("reads almost every clue as a real convention rather than giving up", () => {
    const analysis = analyse(record, SETTINGS);
    const kinds = analysis.interps.reduce<Record<string, number>>((tally, interp) => {
      tally[interp.kind] = (tally[interp.kind] ?? 0) + 1;
      return tally;
    }, {});

    // A real table playing H-Group: 22 of the 24 clues get a reading, and the
    // mix is what you would expect — mostly play clues, a good number of saves
    // on chop, and one 5 clued a slot off the chop to move it.
    //
    // The saves are the interesting number. Every 2 and critical card clued on
    // a chop is one, and reading those as play clues (which is what happens
    // without the save rules) is how a bot talks you into misplaying a card you
    // were being asked to hold. The two left unread are both a critical card
    // clued off chop, which H-Group has no reading for — and scala-bot flags
    // mistakes around the same turns, so the table was off-book there.
    expect(kinds).toEqual({ play: 15, save: 6, "chop move": 1, unclear: 2 });
  });

  /**
   * The whole point of connections, measured on a real game.
   *
   * Every one of these was missed before: reachability was judged against the
   * bare play stacks, so nothing more than one rank past the board could ever
   * be justified and every deeper clue read as a direct play or as nonsense.
   * scala-bot finds the same chains on the same game.
   */
  it("reads clues that only make sense through other people's cards", () => {
    const analysis = analyse(record, SETTINGS);
    const through = analysis.interps.filter((interp) => interp.connections.length > 0);
    expect(through.length).toBeGreaterThanOrEqual(6);

    // The deepest of them: a red clue that only means r5 once three separate
    // players have each put a red card down first.
    const chain = analysis.interps.find((interp) => interp.connections.length >= 3);
    expect(chain).toBeDefined();
    expect(chain?.kind).toBe("play");
    expect(chain?.connections.map((link) => link.identity)).toEqual([
      ordOf(id(RED, 2)),
      ordOf(id(RED, 3)),
      ordOf(id(RED, 4)),
    ]);
    // Three different hands, every one of them a card the whole table has
    // already placed — so the clue costs nobody a blind play.
    const seats = new Set(chain?.connections.map((link) => link.playerIndex));
    expect(seats.size).toBe(3);
    expect(chain?.connections.every((link) => link.kind === "known")).toBe(true);

    // The giver is never one of them: they can see their own clue, so asking
    // them to work something out from it says nothing.
    const giver = giverOf(record, chain!.actionIndex);
    expect(seats.has(giver)).toBe(false);
  });

  it("never writes into the game's own notes", () => {
    const before = JSON.stringify(record);
    const analysis = analyse(record, SETTINGS);
    for (const order of analysis.thoughts.keys()) botNote(analysis, order);
    expect(JSON.stringify(record)).toBe(before);
    expect(record.notes).toEqual({});
  });
});

describe("correcting the bot", () => {
  /** bo is clued red on a fresh board; the bot will read that as r1. */
  function cluedRed() {
    return game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 4), id(RED, 1)),
        ...Array.from({ length: 10 }, () => id(GREEN, 3)),
      ],
      [{ type: ActionType.ColorClue, target: 1, value: RED }],
    );
  }

  it("takes your word for what a card is over its own reading", () => {
    const record = cluedRed();
    expect(botNote(analyse(record, SETTINGS), 9)).toBe("[f] [r1]");

    // At this table the red clue meant the r4 behind it, not r1.
    const corrected = analyse(record, SETTINGS, cards({
      9: { identity: 3 * 1 + 0, fromAction: 1 }, // r4 -> suit 0, rank 4 -> ord 3
    }));
    expect(botNote(corrected, 9)).toBe("[f] [r4]");
    expect(corrected.thoughts.get(9)?.overridden).toBe(true);
  });

  it("takes your word for what a card is doing", () => {
    const record = cluedRed();
    const corrected = analyse(record, SETTINGS, cards({
      9: { status: "chop moved", fromAction: 1 },
    }));
    // No longer called to play; it is being held back instead.
    expect(botNote(corrected, 9)).toBe("[cm] [r1]");
  });

  it("keeps an identity you name even when the clues seem to rule it out", () => {
    const record = cluedRed();
    // Blue is not red — the clue says so — but if you say it is b2, it is b2.
    const corrected = analyse(record, SETTINGS, cards({
      9: { identity: BLUE * 5 + 1, fromAction: 1 },
    }));
    expect(botNote(corrected, 9)).toBe("[f] [b2]");
  });

  it("reasons onward from the correction rather than around it", () => {
    // Clue red, bo plays the r1, and the turn comes back to us holding five
    // cards nobody has said anything about.
    const record = cluedRed();
    record.actions.push({ type: ActionType.Play, target: 9, value: 0 });

    const before = suggestMoves(record, analyse(record, SETTINGS));
    expect(before.find((s) => s.move.kind === "play")).toBeUndefined();

    // Tell the bot our own slot 1 is the r2, and it offers to play it.
    const corrected = analyse(record, SETTINGS, cards({
      4: { status: "called to play", identity: RED * 5 + 1, fromAction: 2 },
    }));
    const play = suggestMoves(record, corrected).find((s) => s.move.kind === "play");
    expect(play?.move).toEqual({ kind: "play", order: 4 });
    expect(play?.value).toBeGreaterThan(0.9);
    expect(play?.reasons.join(" ")).toContain("certain to play");
  });

  it("reads 'saved' as saying which card it could be", () => {
    const record = cluedRed();
    // Our own slot 1, which nothing has touched, so it could be anything.
    const plain = analyse(record, SETTINGS);
    expect(plain.thoughts.get(4)!.inferred.size).toBeGreaterThan(20);

    const corrected = analyse(record, SETTINGS, cards({ 4: { status: "saved", fromAction: 1 } }));
    const inferred = corrected.thoughts.get(4)!.inferred;

    // Saying it was saved rules out everything not worth saving. On a fresh
    // board that is the 5s and the 2s.
    expect(inferred.size).toBe(10);
    for (const ord of inferred) expect([2, 5]).toContain((ord % 5) + 1);
  });

  it("never empties a note by calling an unsavable card saved", () => {
    const record = cluedRed();
    // bo's clued red 1 is not worth saving, so the reading is left alone.
    const corrected = analyse(record, SETTINGS, cards({ 9: { status: "saved", fromAction: 1 } }));
    expect(botNote(corrected, 9)).toBe("r1");
  });

  it("applies from when you said it, not backwards", () => {
    const record = cluedRed();
    // A correction recorded in the future has not happened yet.
    const later = analyse(record, SETTINGS, cards({
      9: { identity: BLUE * 5 + 1, fromAction: 5 },
    }));
    expect(botNote(later, 9)).toBe("[f] [r1]");
    expect(later.thoughts.get(9)?.overridden).toBe(false);
  });
});

describe("convention settings", () => {
  it("is honest about the techniques it does not implement", () => {
    expect(missingTechniques({ ...DEFAULT_BOT_SETTINGS, level: 1 })).toEqual([]);
    // Everything through layered finesses is reasoned about.
    expect(missingTechniques({ ...DEFAULT_BOT_SETTINGS, level: 5 })).toEqual([]);
    const atEleven = missingTechniques({ ...DEFAULT_BOT_SETTINGS, level: 11 }).map((t) => t.name);
    expect(atEleven).toContain("Tempo clues");
    expect(atEleven).toContain("Endgame solving");
    // These two are in, so they must not be claimed as missing.
    expect(atEleven).not.toContain("Bluffs");
    expect(atEleven).not.toContain("Sarcastic discards");
  });

  it("stops looking for finesses below level 2", () => {
    const record = game(
      [
        ...ourHand,
        ...bo(id(BLUE, 4), id(BLUE, 3), id(YELLOW, 4), id(GREEN, 1), id(GREEN, 2)),
        ...Array.from({ length: 10 }, () => id(YELLOW, 3)),
      ],
      [{ type: ActionType.RankClue, target: 1, value: 2 }],
    );

    const beginner = analyse(record, { ...DEFAULT_BOT_SETTINGS, level: 1 });
    const intermediate = analyse(record, { ...DEFAULT_BOT_SETTINGS, level: 5 });

    expect(intermediate.interps.at(-1)?.connections.map((c) => c.kind)).toContain("finesse");
    expect(beginner.interps.at(-1)?.connections).toEqual([]);
  });
});

describe("variants the conventions do not cover", () => {
  it("names the rule that makes H-Group inapplicable", () => {
    const cases: Array<[string, string]> = [
      ["Up or Down (5 Suits)", "either way"],
      ["Sudoku (5 Suits)", "wrap"],
      ["Chimneys (5 Suits)", "whole range"],
      ["Pink-Ones (5 Suits)", "own clue rules"],
      ["Duck (5 Suits)", "never reaches"],
      ["Clue Starved (5 Suits)", "half a clue"],
      ["Color Mute (5 Suits)", "no colour clues"],
      ["Reversed (5 Suits)", "downwards"],
    ];
    for (const [name, fragment] of cases) {
      expect(unsupportedVariantReason(getVariant(name))).toContain(fragment);
    }
  });

  it("still reads the variants whose oddness is only in the suits", () => {
    for (const name of [
      "No Variant",
      "Black (6 Suits)",
      "Rainbow (5 Suits)",
      "Prism (5 Suits)",
      "Ambiguous (6 Suits)",
      "Dual-Color (6 Suits)",
      "Critical Fours (5 Suits)",
      "Scarce Ones (5 Suits)",
    ]) {
      expect(unsupportedVariantReason(getVariant(name))).toBeUndefined();
    }
  });

  it("stands down rather than reading a game it cannot read", () => {
    const deck = [...ourHand, ...bo(id(0, 1), id(1, 1), id(2, 3), id(3, 4), id(4, 5))];
    const record: GameRecord = {
      ...game(deck, [{ type: ActionType.RankClue, target: 1, value: 1 }]),
      variantName: "Chimneys (5 Suits)",
    };
    const analysis = analyse(record, SETTINGS);

    expect(analysis.unsupported).toContain("whole range");
    expect(analysis.thoughts.size).toBe(0);
    expect(analysis.interps).toEqual([]);
    // The board underneath is still replayed exactly as the tracker records it:
    // a Chimneys "1" touches every rank, so the whole hand is clued.
    expect(analysis.state.turn).toBe(2);
    expect(analysis.state.clueTokens).toBe(7);
    for (const order of analysis.state.hands[1]) {
      expect(analysis.state.cards[order].knowledge.clued).toBe(true);
    }
  });
});
