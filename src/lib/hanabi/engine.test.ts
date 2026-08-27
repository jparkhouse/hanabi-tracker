import { describe, expect, it } from "vitest";
import fixture from "./fixtures/live-game-4p.json";
import {
  allowedClueKinds,
  canGiveClue,
  clueTokenLabel,
  identityStatus,
  isCritical,
  isPlayable,
  nextPlayableRanks,
  replay,
  stateOf,
} from "./engine";
import { fromHanabLive } from "./hanabLive";
import { ActionType, handSize, type GameAction, type Identity } from "./types";
import { getVariant, START_RANK } from "./variants";

// A real four-player game recorded at a table, exported from hanab.live's format.
const record = fromHanabLive(fixture, { ourPlayerIndex: 0 });

describe("replaying a real game", () => {
  const state = stateOf(record);

  it("deals seat blocks in hanab.live's order", () => {
    // Seat 0 holds orders 0-3, and the last of them is slot 1.
    expect(state.hands).toHaveLength(4);
    expect(handSize(4)).toBe(4);
    const dealt = replay({
      players: record.players,
      ourPlayerIndex: 0,
      variant: getVariant(record.variantName),
      deck: record.deck,
      actions: [],
      touchedByAction: {},
      options: record.options,
    });
    expect(dealt.hands[0]).toEqual([3, 2, 1, 0]);
    expect(dealt.hands[1]).toEqual([7, 6, 5, 4]);
    expect(dealt.cardsRemaining).toBe(50 - 16);
  });

  it("runs to the end of the deck and stops after the final round", () => {
    expect(state.cardsRemaining).toBe(0);
    expect(state.finished).toBe(true);
    // Every action in the export is consumed: the game ends exactly as recorded.
    expect(state.log).toHaveLength(fixture.actions.length);
  });

  it("scores the game, counting the two cards that were played twice as strikes", () => {
    expect(state.playStacks).toEqual([5, 3, 4, 5, 3]);
    expect(state.score).toBe(20);
    expect(state.strikes).toBe(2);
  });

  it("keeps clue tokens inside the bank", () => {
    expect(state.clueTokens).toBeGreaterThanOrEqual(0);
    expect(state.clueTokens).toBeLessThanOrEqual(8);
  });

  it("scrubs to any point in the game", () => {
    const early = stateOf(record, 4);
    expect(early.log).toHaveLength(4);
    expect(early.turn).toBe(5);
    expect(early.currentPlayerIndex).toBe(0);
  });
});

describe("clue bookkeeping", () => {
  const players = ["us", "them"];
  const variant = getVariant("No Variant");
  const red1: Identity = { suitIndex: 0, rank: 1 };
  const blue2: Identity = { suitIndex: 3, rank: 2 };

  function build(actions: GameAction[], touchedByAction: Record<number, number[]> = {}) {
    // Two players, five cards each: seat 0 gets 0-4, seat 1 gets 5-9.
    const deck: Identity[] = [
      ...Array.from({ length: 5 }, () => ({ suitIndex: -1, rank: -1 })),
      red1,
      blue2,
      red1,
      blue2,
      red1,
    ];
    return replay({
      players,
      ourPlayerIndex: 0,
      variant,
      deck,
      actions,
      touchedByAction,
      options: { deckPlays: false, emptyClues: false },
    });
  }

  it("derives which of a visible hand a clue touched", () => {
    const state = build([{ type: ActionType.ColorClue, target: 1, value: 0 }]);
    const touched = state.hands[1].filter((order) => state.cards[order].knowledge.clued);
    expect(touched.sort()).toEqual([5, 7, 9]);
    expect(state.clueTokens).toBe(7);
  });

  it("records negative information for the cards a clue missed", () => {
    const state = build([{ type: ActionType.RankClue, target: 1, value: 2 }]);
    expect(state.cards[6].knowledge.positiveRanks).toEqual([2]);
    expect(state.cards[5].knowledge.negativeRanks).toEqual([2]);
  });

  it("uses the recorder's tap-selection for clues aimed at our own hand", () => {
    const state = build([{ type: ActionType.RankClue, target: 0, value: 1 }], { 0: [4, 2] });
    expect(state.cards[4].knowledge.positiveRanks).toEqual([1]);
    expect(state.cards[2].knowledge.positiveRanks).toEqual([1]);
    expect(state.cards[3].knowledge.negativeRanks).toEqual([1]);
  });
});

describe("reading a card against the board", () => {
  const variant = getVariant("No Variant");
  const RED = 0;

  // Seat 1 throws away both red 2s, capping red at 1.
  const state = replay({
    players: ["us", "bo"],
    ourPlayerIndex: 0,
    variant,
    deck: [
      { suitIndex: 1, rank: 1 },
      { suitIndex: 1, rank: 2 },
      { suitIndex: 1, rank: 3 },
      { suitIndex: 1, rank: 4 },
      { suitIndex: 1, rank: 5 },
      { suitIndex: 2, rank: 1 },
      { suitIndex: 2, rank: 2 },
      { suitIndex: 2, rank: 3 },
      { suitIndex: RED, rank: 2 },
      { suitIndex: RED, rank: 2 },
      { suitIndex: 3, rank: 1 },
      { suitIndex: 3, rank: 2 },
    ],
    actions: [
      { type: ActionType.RankClue, target: 1, value: 1 },
      { type: ActionType.Discard, target: 9, value: 0 },
      { type: ActionType.RankClue, target: 1, value: 1 },
      { type: ActionType.Discard, target: 8, value: 0 },
    ],
    touchedByAction: {},
    options: { deckPlays: false, emptyClues: false },
  });

  it("calls the bottom of an untouched stack playable", () => {
    expect(identityStatus(state, { suitIndex: RED, rank: 1 })).toBe("playable");
  });

  it("calls anything above a lost card unreachable", () => {
    expect(identityStatus(state, { suitIndex: RED, rank: 3 })).toBe("dead");
    expect(identityStatus(state, { suitIndex: RED, rank: 5 })).toBe("dead");
    // A different suit is untouched by red's misfortune.
    expect(identityStatus(state, { suitIndex: 1, rank: 3 })).toBe("later");
  });

  it("calls a card already on the stack trash", () => {
    const played = replay({
      players: ["us", "bo"],
      ourPlayerIndex: 0,
      variant,
      deck: [
        ...Array.from({ length: 9 }, () => ({ suitIndex: 2, rank: 5 })),
        { suitIndex: RED, rank: 1 },
        { suitIndex: 4, rank: 1 },
      ],
      actions: [
        { type: ActionType.RankClue, target: 1, value: 1 },
        { type: ActionType.Play, target: 9, value: 0 },
      ],
      touchedByAction: {},
      options: { deckPlays: false, emptyClues: false },
    });
    expect(played.playStacks[RED]).toBe(1);
    expect(identityStatus(played, { suitIndex: RED, rank: 1 })).toBe("played");
    expect(identityStatus(played, { suitIndex: RED, rank: 2 })).toBe("playable");
  });

  it("marks the last copy of a card the stack still needs", () => {
    // Both red 2s are gone, so nothing red above 1 is critical any more.
    expect(isCritical(state, { suitIndex: RED, rank: 2 })).toBe(false);
    // Every 5 is critical from the start.
    expect(isCritical(state, { suitIndex: 1, rank: 5 })).toBe(true);
    expect(isCritical(state, { suitIndex: 1, rank: 1 })).toBe(false);
  });
});

describe("play and discard", () => {
  const variant = getVariant("No Variant");

  function twoPlayer(deck: Identity[], actions: GameAction[]) {
    return replay({
      players: ["a", "b"],
      ourPlayerIndex: 1,
      variant,
      deck,
      actions,
      touchedByAction: {},
      options: { deckPlays: false, emptyClues: false },
    });
  }

  const deck: Identity[] = [
    { suitIndex: 0, rank: 2 }, // order 0
    { suitIndex: 0, rank: 1 }, // order 1
    { suitIndex: 1, rank: 1 },
    { suitIndex: 2, rank: 1 },
    { suitIndex: 3, rank: 1 },
    ...Array.from({ length: 6 }, () => ({ suitIndex: 4, rank: 1 })),
  ];

  it("advances the stack on a good play and draws a replacement", () => {
    const state = twoPlayer(deck, [{ type: ActionType.Play, target: 1, value: 0 }]);
    expect(state.playStacks[0]).toBe(1);
    expect(state.score).toBe(1);
    expect(state.strikes).toBe(0);
    expect(state.hands[0]).toHaveLength(5);
    expect(state.hands[0][0]).toBe(10); // the drawn card is slot 1
  });

  it("strikes on a misplay and sends the card to the discard pile", () => {
    const state = twoPlayer(deck, [{ type: ActionType.Play, target: 0, value: 0 }]);
    expect(state.strikes).toBe(1);
    expect(state.score).toBe(0);
    expect(state.discards).toContain(0);
    expect(state.cards[0].failed).toBe(true);
  });

  it("returns a clue token on a discard but never above the cap", () => {
    const state = twoPlayer(deck, [
      { type: ActionType.RankClue, target: 1, value: 1 }, // seat 0: 8 -> 7
      { type: ActionType.Discard, target: 9, value: 0 }, // seat 1: 7 -> 8
      { type: ActionType.Discard, target: 4, value: 0 }, // seat 0: already capped
    ]);
    expect(state.clueTokens).toBe(8);
  });

  it("gives a clue token back for a played five", () => {
    const fives: Identity[] = [
      { suitIndex: 0, rank: 5 },
      ...Array.from({ length: 10 }, () => ({ suitIndex: 4, rank: 1 })),
    ];
    const state = replay({
      players: ["a", "b"],
      ourPlayerIndex: 1,
      variant,
      deck: fives,
      actions: [
        { type: ActionType.RankClue, target: 1, value: 1 },
        { type: ActionType.RankClue, target: 0, value: 1 },
        // Seat 0 plays the red 5 onto an empty stack: a misplay, not a bonus clue.
        { type: ActionType.Play, target: 0, value: 0 },
      ],
      touchedByAction: {},
      options: { deckPlays: false, emptyClues: false },
    });
    expect(state.strikes).toBe(1);
    expect(state.clueTokens).toBe(6);
  });
});

describe("variants that change what playing means", () => {
  /**
   * Builds a game whose deck starts with the cards under test, padded out with a
   * junk suit so the deal and the draws never run dry.
   */
  function game(variantName: string, head: Identity[], actions: GameAction[], junkSuit = 4) {
    const variant = getVariant(variantName);
    const deck: Identity[] = [
      ...head,
      ...Array.from({ length: variant.totalCards - head.length }, () => ({
        suitIndex: junkSuit,
        rank: 1,
      })),
    ];
    return replay({
      players: ["a", "b"],
      ourPlayerIndex: 1,
      variant,
      deck,
      actions,
      touchedByAction: {},
      options: { deckPlays: false, emptyClues: false },
    });
  }

  const play = (target: number): GameAction => ({ type: ActionType.Play, target, value: 0 });

  it("starts a reversed suit at 5 and runs it down", () => {
    const reversed = getVariant("Reversed (5 Suits)");
    const suit = 4; // the only reversed suit in this variant
    // Order 0 is a 5 and order 1 a 1, both of the reversed suit.
    const state = game(
      "Reversed (5 Suits)",
      [
        { suitIndex: suit, rank: 5 },
        { suitIndex: suit, rank: 1 },
      ],
      [],
      0,
    );
    expect(nextPlayableRanks(state, suit)).toEqual([5]);
    expect(isPlayable(state, { suitIndex: suit, rank: 5 })).toBe(true);
    expect(isPlayable(state, { suitIndex: suit, rank: 1 })).toBe(false);
    // The ordinary suits still run upwards in the same game.
    expect(nextPlayableRanks(state, 0)).toEqual([1]);
    expect(reversed.suits[suit].reversed).toBe(true);

    const after = game(
      "Reversed (5 Suits)",
      [
        { suitIndex: suit, rank: 5 },
        { suitIndex: suit, rank: 1 },
      ],
      [play(0)],
      0,
    );
    expect(after.score).toBe(1);
    expect(nextPlayableRanks(after, suit)).toEqual([4]);
    expect(identityStatus(after, { suitIndex: suit, rank: 5 })).toBe("played");
  });

  it("lets an Up or Down stack open with a 1, a 5 or a START", () => {
    const head: Identity[] = [
      { suitIndex: 0, rank: START_RANK }, // order 0
      { suitIndex: 0, rank: 4 }, // order 1
      { suitIndex: 0, rank: 3 }, // order 2
    ];
    const fresh = game("Up or Down (5 Suits)", head, []);
    expect(fresh.playStackDirections[0]).toBe("undecided");
    expect(nextPlayableRanks(fresh, 0)).toEqual([1, 5, START_RANK]);

    // START goes down first, which leaves 2 and 4 as the ways to commit.
    const started = game("Up or Down (5 Suits)", head, [play(0)]);
    expect(started.score).toBe(1);
    expect(started.playStackDirections[0]).toBe("undecided");
    expect(nextPlayableRanks(started, 0)).toEqual([2, 4]);

    // Playing the 4 commits the suit downwards, so a 3 comes next, not a 5.
    const committed = game("Up or Down (5 Suits)", head, [play(0), play(1)]);
    expect(committed.playStackDirections[0]).toBe("down");
    expect(nextPlayableRanks(committed, 0)).toEqual([3]);
    expect(identityStatus(committed, { suitIndex: 0, rank: 5 })).toBe("dead");
    expect(identityStatus(committed, { suitIndex: 0, rank: 2 })).toBe("later");
  });

  it("hands a clue back for finishing a stack, not for playing a five", () => {
    // Going down, the 1 finishes the suit; the 5 that started it does not.
    const head: Identity[] = [
      { suitIndex: 0, rank: 5 },
      { suitIndex: 0, rank: 4 },
      { suitIndex: 0, rank: 3 },
      { suitIndex: 0, rank: 2 },
      { suitIndex: 0, rank: 1 },
    ];
    const afterFive = game("Up or Down (5 Suits)", head, [
      { type: ActionType.RankClue, target: 1, value: 1 },
      { type: ActionType.RankClue, target: 0, value: 1 },
      play(0),
    ]);
    expect(afterFive.score).toBe(1);
    expect(afterFive.clueTokens).toBe(6);
  });

  it("pays the stack-completion clue to whichever card actually finishes it", () => {
    // Five cards of one suit, played 5-4-3-2-1. The 1 completes the stack.
    const head: Identity[] = [
      { suitIndex: 0, rank: 5 },
      { suitIndex: 0, rank: 4 },
      { suitIndex: 0, rank: 3 },
      { suitIndex: 0, rank: 2 },
      { suitIndex: 0, rank: 1 },
    ];
    const plays = [play(0), play(1), play(2), play(3), play(4)];
    const spend: GameAction[] = [
      { type: ActionType.RankClue, target: 1, value: 2 },
      { type: ActionType.RankClue, target: 0, value: 2 },
    ];

    // Four cards down, the stack is unfinished and no clue has come back.
    const partway = game("Up or Down (5 Suits)", head, [...spend, ...plays.slice(0, 4)]);
    expect(partway.score).toBe(4);
    expect(partway.clueTokens).toBe(6);

    const done = game("Up or Down (5 Suits)", head, [...spend, ...plays]);
    expect(done.score).toBe(5);
    expect(done.playStackDirections[0]).toBe("finished");
    expect(done.clueTokens).toBe(7);
  });

  it("holds off calling an Up or Down 1 critical while the suit could still go up", () => {
    // Up or Down deals a single 1, but a suit that can still start on 5 or START
    // does not need it, so losing it costs nothing yet.
    const head: Identity[] = [{ suitIndex: 0, rank: 1 }];
    const fresh = game("Up or Down (5 Suits)", head, []);
    expect(fresh.playStackDirections[0]).toBe("undecided");
    expect(isCritical(fresh, { suitIndex: 0, rank: 1 })).toBe(false);

    // Once the suit commits downwards the 1 is the card that finishes it.
    const down = game(
      "Up or Down (5 Suits)",
      [
        { suitIndex: 0, rank: 5 },
        { suitIndex: 0, rank: 4 },
        { suitIndex: 0, rank: 1 },
      ],
      [play(0), play(1)],
    );
    expect(down.playStackDirections[0]).toBe("down");
    expect(isCritical(down, { suitIndex: 0, rank: 1 })).toBe(true);
  });

  it("starts each Sudoku stack on its own rank and wraps at the top", () => {
    const head: Identity[] = [
      { suitIndex: 0, rank: 4 }, // order 0
      { suitIndex: 0, rank: 1 }, // order 1: 4 wraps to 1, not to 5
    ];
    const fresh = game("Sudoku (4 Suits)", head, [], 3);
    expect(fresh.variant.stackSize).toBe(4);
    expect(nextPlayableRanks(fresh, 0)).toEqual([1, 2, 3, 4]);

    const started = game("Sudoku (4 Suits)", head, [play(0)], 3);
    expect(started.playStackStarts[0]).toBe(4);
    // Wrapping: after the 4 comes the 1.
    expect(nextPlayableRanks(started, 0)).toEqual([1]);
    // And no other suit may open on a 4 any more.
    expect(nextPlayableRanks(started, 1)).toEqual([1, 2, 3]);
  });

  it("spends whole clues and earns half of one back when Clue Starved", () => {
    const state = game(
      "Clue Starved (5 Suits)",
      [{ suitIndex: 0, rank: 1 }],
      [
        { type: ActionType.RankClue, target: 1, value: 1 }, // 8 -> 7
        { type: ActionType.Discard, target: 9, value: 0 }, // 7 -> 7.5
      ],
    );
    expect(state.clueTokens).toBe(7.5);
    expect(clueTokenLabel(state.clueTokens)).toBe("7½");
  });

  it("makes Alternating Clues refuse two of a kind in a row", () => {
    const afterColour = game("Alternating Clues (5 Suits)", [{ suitIndex: 0, rank: 1 }], [
      { type: ActionType.ColorClue, target: 1, value: 0 },
    ]);
    expect(afterColour.lastClueKind).toBe("color");
    expect(allowedClueKinds(afterColour)).toEqual(["rank"]);
    expect(canGiveClue(afterColour)).toBe(true);

    const afterRank = game("Alternating Clues (5 Suits)", [{ suitIndex: 0, rank: 1 }], [
      { type: ActionType.ColorClue, target: 1, value: 0 },
      { type: ActionType.RankClue, target: 0, value: 1 },
    ]);
    expect(allowedClueKinds(afterRank)).toEqual(["color"]);
  });

  it("leaves a Duck clue pointing at cards but saying nothing about them", () => {
    const head: Identity[] = [{ suitIndex: 0, rank: 1 }];
    const state = game("Duck (5 Suits)", head, [
      { type: ActionType.RankClue, target: 1, value: 1 },
    ]);
    // Seat 1 holds orders 5-9; the junk suit is all 1s, so a "1" touches them.
    const touched = state.hands[1].filter((order) => state.cards[order].knowledge.clued);
    expect(touched.length).toBeGreaterThan(0);
    for (const order of state.hands[1]) {
      expect(state.cards[order].knowledge.positiveRanks).toEqual([]);
      expect(state.cards[order].knowledge.negativeRanks).toEqual([]);
    }
  });

  it("offers no clue of a kind the variant does not have", () => {
    const mute = game("Color Mute (5 Suits)", [{ suitIndex: 0, rank: 1 }], []);
    expect(allowedClueKinds(mute)).toEqual(["rank"]);
    const synesthesia = game("Synesthesia (5 Suits)", [{ suitIndex: 0, rank: 1 }], []);
    expect(allowedClueKinds(synesthesia)).toEqual(["color"]);
  });
});
