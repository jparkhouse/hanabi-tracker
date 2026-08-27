import { describe, expect, it } from "vitest";
import fixture from "./fixtures/live-game-4p.json";
import { ImportError, exportIssues, fromHanabLive, serialize, toHanabLive } from "./hanabLive";
import { createGame, setNote } from "./recording";
import { ActionType, UNKNOWN, type GameAction, type Identity } from "./types";
import { stateOf } from "./engine";
import { allIdentities, copiesOf, getVariant, START_RANK } from "./variants";

describe("round-tripping hanab.live JSON", () => {
  it("re-exports an imported game byte for byte", () => {
    const record = fromHanabLive(fixture, { ourPlayerIndex: 0 });
    expect(JSON.parse(serialize(record))).toEqual(fixture);
  });

  it("keeps hidden cards hidden rather than inventing faces", () => {
    const hidden = {
      ...fixture,
      deck: fixture.deck.map((card, index) => (index < 4 ? { suitIndex: -1, rank: -1 } : card)),
    };
    const record = fromHanabLive(hidden, { ourPlayerIndex: 0 });
    expect(record.deck.slice(0, 4)).toEqual([UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN]);
    expect(toHanabLive(record).deck.slice(0, 4)).toEqual([
      { suitIndex: -1, rank: -1 },
      { suitIndex: -1, rank: -1 },
      { suitIndex: -1, rank: -1 },
      { suitIndex: -1, rank: -1 },
    ]);
  });

  it("rejects files that are not games", () => {
    expect(() => fromHanabLive({ players: ["a", "b"] })).toThrow(ImportError);
    expect(() => fromHanabLive({ ...fixture, players: ["solo"] })).toThrow(ImportError);
    expect(() => fromHanabLive({ ...fixture, options: { variant: "Chimneys" } })).toThrow(
      ImportError,
    );
  });
});

describe("export shape", () => {
  const base = createGame({
    players: ["ana", "bo", "cy"],
    ourPlayerIndex: 1,
    variantName: "Black (6 Suits)",
  });

  it("writes the variant name hanab.live expects", () => {
    expect(toHanabLive(base).options).toEqual({ variant: "Black (6 Suits)" });
  });

  it("only mentions house rules when they are on", () => {
    const houseRules = createGame({
      players: ["ana", "bo"],
      ourPlayerIndex: 0,
      variantName: "No Variant",
      options: { deckPlays: true, emptyClues: false },
    });
    expect(toHanabLive(houseRules).options).toEqual({ variant: "No Variant", deckPlays: true });
  });

  it("files notes under the seat that wrote them", () => {
    const noted = setNote(base, 4, "probably b1");
    const exported = toHanabLive(noted);
    expect(exported.notes).toHaveLength(3);
    expect(exported.notes[1]).toEqual(["", "", "", "", "probably b1"]);
    expect(exported.notes[0]).toEqual([]);
  });
});

describe("exportIssues", () => {
  it("warns while cards are still hidden", () => {
    const record = createGame({
      players: ["ana", "bo"],
      ourPlayerIndex: 0,
      variantName: "No Variant",
    });
    const issues = exportIssues(record);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].message).toContain("10 cards still unidentified");
  });

  it("is quiet about a complete game", () => {
    expect(exportIssues(fromHanabLive(fixture))).toEqual([]);
  });

  it("catches a card entered more times than the variant has copies", () => {
    const record = fromHanabLive(fixture);
    // The red 5 is unique; a second one means a slip somewhere.
    record.deck[0] = { suitIndex: 0, rank: 5 };
    record.deck[1] = { suitIndex: 0, rank: 5 };
    const errors = exportIssues(record).filter((issue) => issue.severity === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("Red 5");
  });
});

describe("round-tripping the variants with their own rules", () => {
  /** A finished-looking record whose deck is spelled out card by card. */
  function record(variantName: string, deck: Identity[], actions: GameAction[]) {
    return {
      ...createGame({ players: ["ana", "bo"], ourPlayerIndex: 1, variantName }),
      deck,
      actions,
    };
  }

  /**
   * The named cards, then whatever copies of the variant's deck are left over,
   * so the result is a legal deck and the copy-count check has nothing to say
   * about the padding.
   */
  function fill(variantName: string, head: Identity[]): Identity[] {
    const variant = getVariant(variantName);
    const left = new Map(
      allIdentities(variant).map((identity) => [
        `${identity.suitIndex}:${identity.rank}`,
        copiesOf(variant, identity),
      ]),
    );
    for (const card of head) {
      const key = `${card.suitIndex}:${card.rank}`;
      left.set(key, (left.get(key) ?? 0) - 1);
    }
    const rest: Identity[] = [];
    for (const [key, count] of left) {
      const [suitIndex, rank] = key.split(":").map(Number);
      for (let i = 0; i < count; i++) rest.push({ suitIndex, rank });
    }
    return [...head, ...rest];
  }

  it("carries an Up or Down START card out and back as rank 7", () => {
    const name = "Up or Down (5 Suits)";
    const deck = fill(name, [
      { suitIndex: 0, rank: START_RANK },
      { suitIndex: 0, rank: 4 },
    ]);
    const original = record(name, deck, [
      { type: ActionType.Play, target: 0, value: 0 },
      { type: ActionType.Play, target: 1, value: 0 },
    ]);

    const json = JSON.parse(serialize(original));
    expect(json.deck[0]).toEqual({ suitIndex: 0, rank: 7 });
    expect(json.options.variant).toBe(name);
    expect(exportIssues(original).filter((issue) => issue.severity === "error")).toEqual([]);

    // Re-imported, it replays to the same board: START then 4 commits the suit
    // downwards, which is a fact about the rules and not about the file.
    const reimported = fromHanabLive(json, { ourPlayerIndex: 1 });
    const state = stateOf(reimported);
    expect(state.score).toBe(2);
    expect(state.playStackDirections[0]).toBe("down");
    expect(state.strikes).toBe(0);
  });

  it("replays a Chimneys clue as touching the whole range above it", () => {
    const name = "Chimneys (5 Suits)";
    // Seat 1 holds orders 5-9: ranks 1 to 5 of one suit.
    const deck = fill(name, [
      ...Array.from({ length: 5 }, () => ({ suitIndex: 4, rank: 1 })),
      { suitIndex: 0, rank: 1 },
      { suitIndex: 0, rank: 2 },
      { suitIndex: 0, rank: 3 },
      { suitIndex: 0, rank: 4 },
      { suitIndex: 0, rank: 5 },
    ]);
    const original = record(name, deck, [{ type: ActionType.RankClue, target: 1, value: 3 }]);

    const state = stateOf(fromHanabLive(JSON.parse(serialize(original)), { ourPlayerIndex: 0 }));
    // A "3" reaches the 3, 4 and 5 but not the 1 or the 2.
    const clued = state.hands[1].filter((order) => state.cards[order].knowledge.clued);
    expect(clued.map((order) => state.cards[order].identity.rank).sort()).toEqual([3, 4, 5]);
  });

  it("flags a deck holding more copies than the variant allows", () => {
    const name = "Critical Fours (5 Suits)";
    // Critical Fours deals a single 4 per suit, so a second Red 4 is one too many.
    const deck = fill(name, [{ suitIndex: 0, rank: 4 }]);
    deck[1] = { suitIndex: 0, rank: 4 };
    const errors = exportIssues(record(name, deck, [])).filter((i) => i.severity === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("Red 4");
    expect(errors[0].message).toContain("only has 1");
  });
});
