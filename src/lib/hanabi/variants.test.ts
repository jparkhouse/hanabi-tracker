import { describe, expect, it } from "vitest";
import {
  DEFAULT_VARIANT_NAME,
  START_RANK,
  VARIANT_NAMES,
  allIdentities,
  cardTouched,
  clueName,
  copiesOf,
  getVariant,
  searchVariants,
  variantNotes,
  type Variant,
} from "./variants";

/** Every colour index that touches a card, which is what a clue button means. */
function coloursTouching(variant: Variant, suitIndex: number, rank: number): number[] {
  return variant.clueColors
    .map((_, value) => value)
    .filter((value) => cardTouched(variant, { suitIndex, rank }, { kind: "color", value }));
}

/** Every rank clue that touches a card. */
function ranksTouching(variant: Variant, suitIndex: number, rank: number): number[] {
  return variant.clueRanks.filter((value) =>
    cardTouched(variant, { suitIndex, rank }, { kind: "rank", value }),
  );
}

describe("variant data", () => {
  it("bundles every variant hanab.live offers, under its own name", () => {
    expect(VARIANT_NAMES.length).toBeGreaterThan(2400);
    for (const name of [
      "No Variant",
      "6 Suits",
      "Black (6 Suits)",
      "Rainbow (5 Suits)",
      "Up or Down (5 Suits)",
      "Sudoku (4 Suits)",
      "Ambiguous (6 Suits)",
      "Deceptive-Ones (5 Suits)",
      "Throw It in a Hole (5 Suits)",
    ]) {
      expect(VARIANT_NAMES).toContain(name);
    }
  });

  it("counts the deck the way hanab.live does", () => {
    expect(getVariant("No Variant").totalCards).toBe(50);
    expect(getVariant("6 Suits").totalCards).toBe(60);
    // Black is one-of-each, so its suit contributes 5 rather than 10.
    expect(getVariant("Black (6 Suits)").totalCards).toBe(55);
    expect(getVariant("4 Suits").totalCards).toBe(40);
    // Up or Down trades two 1s for a START card: nine per suit, not ten.
    expect(getVariant("Up or Down (5 Suits)").totalCards).toBe(45);
    // A one-of-each suit in Up or Down is its five cards plus a START.
    expect(getVariant("Up or Down & Black (6 Suits)").totalCards).toBe(51);
    // Sudoku has two of everything, over a four-high stack in the 4-suit game.
    expect(getVariant("Sudoku (5 Suits)").totalCards).toBe(50);
    expect(getVariant("Sudoku (4 Suits)").totalCards).toBe(32);
    // A reversed suit keeps ten cards; the scarcity moves from the 5 to the 1.
    // Only the last suit is reversed, so suit 0 stays ordinary.
    const reversed = getVariant("Reversed (5 Suits)");
    expect(reversed.totalCards).toBe(50);
    expect(reversed.suits[4].reversed).toBe(true);
    expect(copiesOf(reversed, { suitIndex: 4, rank: 1 })).toBe(1);
    expect(copiesOf(reversed, { suitIndex: 4, rank: 5 })).toBe(3);
    expect(copiesOf(reversed, { suitIndex: 0, rank: 1 })).toBe(3);
    expect(copiesOf(getVariant("Critical Fours (5 Suits)"), { suitIndex: 0, rank: 4 })).toBe(1);
    expect(copiesOf(getVariant("Scarce Ones (5 Suits)"), { suitIndex: 0, rank: 1 })).toBe(2);
  });

  /**
   * hanab.live sizes a deck twice over, from the suit down (`getTotalCardsInSuit`)
   * and from the card up (`getNumCopiesOfCard`). Only the second is ported here,
   * so holding it against the first is a real check on all 2400-odd variants
   * rather than a restatement of the port.
   */
  it("agrees with hanab.live's independent per-suit deck size, for every variant", () => {
    for (const name of VARIANT_NAMES) {
      const variant = getVariant(name);
      const rules = variant.rules;
      variant.suits.forEach((suit, suitIndex) => {
        const expected = suit.oneOfEach
          ? rules.upOrDown
            ? variant.stackSize + 1
            : variant.stackSize
          : rules.upOrDown || rules.criticalRank || rules.scarceOnes
            ? variant.stackSize * 2 - 1
            : variant.stackSize * 2;
        const actual = variant.ranks.reduce(
          (sum, rank) => sum + copiesOf(variant, { suitIndex, rank }),
          0,
        );
        expect(`${name} / ${suit.name}: ${actual}`).toBe(`${name} / ${suit.name}: ${expected}`);
      });
    }
  });

  it("offers a colour clue only for suits a colour clue can name", () => {
    expect(getVariant(DEFAULT_VARIANT_NAME).clueColors.map((c) => c.name)).toEqual([
      "Red",
      "Yellow",
      "Green",
      "Blue",
      "Purple",
    ]);
    // Rainbow is touched by every colour, so it gets no button of its own.
    expect(getVariant("Rainbow (6 Suits)").clueColors).toHaveLength(5);
    // Black is an ordinary colour, just scarce.
    expect(getVariant("Black (6 Suits)").clueColors).toHaveLength(6);
    // Ambiguous pairs two suits onto each colour, so six suits share three buttons.
    expect(getVariant("Ambiguous (6 Suits)").clueColors.map((c) => c.name)).toEqual([
      "Red",
      "Green",
      "Blue",
    ]);
    // Mute and Blind variants take a whole kind of clue away.
    expect(getVariant("Color Mute (5 Suits)").clueColors).toHaveLength(0);
    expect(getVariant("Number Mute (5 Suits)").clueRanks).toHaveLength(0);
    expect(getVariant("Synesthesia (5 Suits)").clueRanks).toHaveLength(0);
    // A pink 1 answers to every rank, so cluing "1" would say nothing.
    expect(getVariant("Pink-Ones (5 Suits)").clueRanks).toEqual([2, 3, 4, 5]);
  });

  it("gives every suit a distinct letter, in every variant", () => {
    for (const name of VARIANT_NAMES) {
      const variant = getVariant(name);
      expect(new Set(variant.abbreviations).size).toBe(variant.suits.length);
    }
  });
});

describe("cardTouched", () => {
  const noVariant = getVariant("No Variant");

  it("matches colour and rank in the base game", () => {
    expect(cardTouched(noVariant, { suitIndex: 2, rank: 3 }, { kind: "color", value: 2 })).toBe(true);
    expect(cardTouched(noVariant, { suitIndex: 2, rank: 3 }, { kind: "color", value: 1 })).toBe(false);
    expect(cardTouched(noVariant, { suitIndex: 2, rank: 3 }, { kind: "rank", value: 3 })).toBe(true);
    expect(cardTouched(noVariant, { suitIndex: 2, rank: 3 }, { kind: "rank", value: 4 })).toBe(false);
  });

  it("touches rainbow with every colour and white with none", () => {
    const rainbow = getVariant("Rainbow (6 Suits)");
    for (let value = 0; value < rainbow.clueColors.length; value++) {
      expect(cardTouched(rainbow, { suitIndex: 5, rank: 1 }, { kind: "color", value })).toBe(true);
    }

    const white = getVariant("White (6 Suits)");
    for (let value = 0; value < white.clueColors.length; value++) {
      expect(cardTouched(white, { suitIndex: 5, rank: 1 }, { kind: "color", value })).toBe(false);
    }
  });

  it("touches pink with every rank and brown with none", () => {
    const pink = getVariant("Pink (6 Suits)");
    expect(cardTouched(pink, { suitIndex: 5, rank: 2 }, { kind: "rank", value: 4 })).toBe(true);

    const brown = getVariant("Brown (6 Suits)");
    expect(cardTouched(brown, { suitIndex: 5, rank: 2 }, { kind: "rank", value: 2 })).toBe(false);
  });

  it("cycles prism through the colours by rank", () => {
    const prism = getVariant("Prism (6 Suits)");
    const colours = prism.clueColors.length;
    for (const rank of [1, 2, 3, 4, 5]) {
      const expected = (rank - 1) % colours;
      for (let value = 0; value < colours; value++) {
        expect(cardTouched(prism, { suitIndex: 5, rank }, { kind: "color", value })).toBe(
          value === expected,
        );
      }
    }
  });

  it("gives one colour to two suits in Ambiguous, and two colours to one suit in Dual-Color", () => {
    // Tomato and Mahogany are both Red; nothing distinguishes them by colour.
    const ambiguous = getVariant("Ambiguous (6 Suits)");
    expect(coloursTouching(ambiguous, 0, 3)).toEqual([0]);
    expect(coloursTouching(ambiguous, 1, 3)).toEqual([0]);
    expect(coloursTouching(ambiguous, 2, 3)).toEqual([1]);

    // Tangerine answers to Red and Yellow alike.
    const dual = getVariant("Dual-Color (6 Suits)");
    expect(coloursTouching(dual, 0, 3).length).toBe(2);
  });

  it("makes the special rank answer to every colour, or to none", () => {
    const rainbowOnes = getVariant("Rainbow-Ones (5 Suits)");
    expect(coloursTouching(rainbowOnes, 0, 1)).toHaveLength(5);
    expect(coloursTouching(rainbowOnes, 0, 2)).toEqual([0]);

    const whiteOnes = getVariant("White-Ones (5 Suits)");
    expect(coloursTouching(whiteOnes, 0, 1)).toEqual([]);
    expect(coloursTouching(whiteOnes, 0, 2)).toEqual([0]);

    const pinkOnes = getVariant("Pink-Ones (5 Suits)");
    expect(ranksTouching(pinkOnes, 0, 1)).toEqual([2, 3, 4, 5]);
    expect(ranksTouching(pinkOnes, 0, 3)).toEqual([3]);

    const brownOnes = getVariant("Brown-Ones (5 Suits)");
    expect(ranksTouching(brownOnes, 0, 1)).toEqual([]);
  });

  it("points a deceptive card at a rank chosen by its suit", () => {
    const deceptive = getVariant("Deceptive-Ones (5 Suits)");
    // clueRanks are [2,3,4,5]; suit i answers to clueRanks[i % 4], never to 1.
    expect(ranksTouching(deceptive, 0, 1)).toEqual([2]);
    expect(ranksTouching(deceptive, 1, 1)).toEqual([3]);
    expect(ranksTouching(deceptive, 3, 1)).toEqual([5]);
    expect(ranksTouching(deceptive, 4, 1)).toEqual([2]);
    // Everything else is ordinary.
    expect(ranksTouching(deceptive, 0, 4)).toEqual([4]);
  });

  it("pours a funnel down and a chimney up", () => {
    const funnels = getVariant("Funnels (5 Suits)");
    expect(ranksTouching(funnels, 0, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(ranksTouching(funnels, 0, 3)).toEqual([3, 4, 5]);
    expect(ranksTouching(funnels, 0, 5)).toEqual([5]);

    const chimneys = getVariant("Chimneys (5 Suits)");
    expect(ranksTouching(chimneys, 0, 1)).toEqual([1]);
    expect(ranksTouching(chimneys, 0, 3)).toEqual([1, 2, 3]);
    expect(ranksTouching(chimneys, 0, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("splits Odds and Evens by parity", () => {
    const variant = getVariant("Odds and Evens (5 Suits)");
    expect(variant.clueRanks).toEqual([1, 2]);
    for (const rank of [1, 3, 5]) expect(ranksTouching(variant, 0, rank)).toEqual([1]);
    for (const rank of [2, 4]) expect(ranksTouching(variant, 0, rank)).toEqual([2]);
    expect(clueName(variant, { kind: "rank", value: 1 })).toBe("Odd");
    expect(clueName(variant, { kind: "rank", value: 2 })).toBe("Even");
  });

  it("lets a Synesthesia colour clue stand in for a rank", () => {
    const variant = getVariant("Synesthesia (5 Suits)");
    // Green is colour index 2, so it takes every 3 as well as its own suit.
    expect(coloursTouching(variant, 2, 3)).toEqual([2]);
    expect(coloursTouching(variant, 0, 3)).toEqual([0, 2]);
    expect(coloursTouching(variant, 0, 1)).toEqual([0]);
  });

  it("touches nothing at all in the Blind variants", () => {
    const colorBlind = getVariant("Color Blind (5 Suits)");
    expect(coloursTouching(colorBlind, 0, 1)).toEqual([]);
    expect(ranksTouching(colorBlind, 0, 1)).toEqual([1]);

    const totallyBlind = getVariant("Totally Blind (5 Suits)");
    expect(coloursTouching(totallyBlind, 0, 1)).toEqual([]);
    expect(ranksTouching(totallyBlind, 0, 1)).toEqual([]);
  });

  it("says only moo, oink or quack where that is all you may say", () => {
    const cowAndPig = getVariant("Cow & Pig (5 Suits)");
    expect(clueName(cowAndPig, { kind: "color", value: 0 })).toBe("Moo");
    expect(clueName(cowAndPig, { kind: "rank", value: 3 })).toBe("Oink");
    expect(clueName(getVariant("Duck (5 Suits)"), { kind: "rank", value: 3 })).toBe("Quack");
    // The clue still points at the right cards; only the word for it changes.
    expect(cardTouched(cowAndPig, { suitIndex: 0, rank: 3 }, { kind: "rank", value: 3 })).toBe(true);
  });

  it("enumerates the ranks a variant actually has", () => {
    expect(allIdentities(getVariant("6 Suits"))).toHaveLength(30);
    // Up or Down adds a START card to every suit.
    expect(getVariant("Up or Down (5 Suits)").ranks).toEqual([1, 2, 3, 4, 5, START_RANK]);
    expect(allIdentities(getVariant("Up or Down (5 Suits)"))).toHaveLength(30);
    // A four-suit Sudoku stack only goes up to 4.
    expect(getVariant("Sudoku (4 Suits)").ranks).toEqual([1, 2, 3, 4]);
    expect(allIdentities(getVariant("Sudoku (4 Suits)"))).toHaveLength(16);
  });

  it("never returns true for a colour a variant does not offer", () => {
    for (const name of ["Color Mute (5 Suits)", "Color Blind (5 Suits)"]) {
      const variant = getVariant(name);
      for (const identity of allIdentities(variant)) {
        expect(coloursTouching(variant, identity.suitIndex, identity.rank)).toEqual([]);
      }
    }
  });
});

describe("variantNotes", () => {
  it("says nothing about an ordinary variant", () => {
    expect(variantNotes(getVariant("No Variant"))).toEqual([]);
    expect(variantNotes(getVariant("Black (6 Suits)"))).toEqual([]);
  });

  it("explains what the name does not", () => {
    expect(variantNotes(getVariant("Chimneys (5 Suits)"))[0]).toContain("everything above");
    expect(variantNotes(getVariant("Clue Starved (5 Suits)"))[0]).toContain("half a clue");
    expect(variantNotes(getVariant("Rainbow-Ones (5 Suits)"))[0]).toBe(
      "1s are touched by every colour",
    );
    expect(variantNotes(getVariant("Critical Fours (5 Suits)"))[0]).toBe(
      "only one 4 of each suit",
    );
  });
});

describe("searchVariants", () => {
  it("matches on every word, in any order", () => {
    expect(searchVariants("black 6")).toContain("Black (6 Suits)");
    expect(searchVariants("6 black")).toContain("Black (6 Suits)");
    expect(searchVariants("zzz")).toEqual([]);
  });
});
