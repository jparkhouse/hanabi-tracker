/**
 * Runtime variant model, built from the generated `variantData.ts`.
 *
 * The clue-touch rules are a port of hanab.live's `isCardTouchedByClue`, and the
 * deck composition a port of its `getNumCopiesOfCard`, so that a clue recorded
 * here means the same thing when the export is replayed there. Where the two
 * disagree the port is wrong, so keep the branch order below identical to
 * theirs — several rules only differ by which one wins.
 *
 * Stack behaviour (which rank plays next, and whether a stack runs up or down)
 * needs game state, so it lives in `engine.ts`.
 */
import { COLORS, RULE_SETS, SUITS, VARIANTS, type RuleSet, type SuitDef } from "./variantData";
import type { Clue, Identity } from "./types";

export type { SuitDef, RuleSet };

/**
 * The rank of an Up or Down START card, which plays on an empty stack and lets
 * the suit run either direction afterwards. hanab.live's number, and part of the
 * export format.
 */
export const START_RANK = 7;

export interface ClueColor {
  /** Label on the clue button, e.g. `Red`, which may name several suits. */
  name: string;
  fill: string;
}

export interface Variant {
  name: string;
  suits: readonly SuitDef[];
  /** Per-suit display letters, made unique within the variant. */
  abbreviations: readonly string[];
  /** Colour clues available, in the order hanab.live indexes them. */
  clueColors: readonly ClueColor[];
  clueRanks: readonly number[];
  /** Every rank on a card in this variant, including START where it exists. */
  ranks: readonly number[];
  /** Cards needed to finish one stack: 5, or 4 in four-suit Sudoku. */
  stackSize: number;
  /** Copies of each rank, per suit, indexed `[suitIndex][rank]`. */
  cardCounts: readonly (readonly number[])[];
  totalCards: number;
  maxScore: number;
  rules: RuleSet;
}

export const RANKS = [1, 2, 3, 4, 5] as const;

const fillByColor = new Map(COLORS.map((c) => [c.name, c.fill]));

const cache = new Map<string, Variant>();

export const VARIANT_NAMES: readonly string[] = VARIANTS.map(([name]) => name);
export const DEFAULT_VARIANT_NAME = "No Variant";

const definitions = new Map(VARIANTS.map(([name, suits, rules]) => [name, { suits, rules }]));

export function variantExists(name: string): boolean {
  return definitions.has(name);
}

export function getVariant(name: string): Variant {
  const cached = cache.get(name);
  if (cached) return cached;

  const definition = definitions.get(name);
  if (!definition) throw new Error(`Unknown variant: ${name}`);

  const suits = definition.suits.map((i) => SUITS[i]);
  const rules = RULE_SETS[definition.rules];

  const ranks: number[] = RANKS.slice(0, rules.stackSize);
  if (rules.upOrDown) ranks.push(START_RANK);

  const cardCounts = suits.map((suit) => {
    const counts: number[] = [];
    for (const rank of ranks) counts[rank] = copies(suit, rank, rules);
    return counts;
  });

  const variant: Variant = {
    name,
    suits,
    abbreviations: uniqueAbbreviations(suits),
    clueColors: clueColorsOf(suits, rules),
    clueRanks: rules.clueRanks,
    ranks,
    stackSize: rules.stackSize,
    cardCounts,
    totalCards: cardCounts.reduce((sum, counts) => sum + sumOf(counts), 0),
    maxScore: suits.length * rules.stackSize,
    rules,
  };

  cache.set(name, variant);
  return variant;
}

function sumOf(counts: readonly number[]): number {
  let total = 0;
  for (const count of counts) total += count ?? 0;
  return total;
}

/** Ports hanab.live's `getNumCopiesOfCard`. */
function copies(suit: SuitDef, rank: number, rules: RuleSet): number {
  if (suit.oneOfEach) return 1;
  if (rules.criticalRank === rank) return 1;
  if (rules.sudoku) return 2;
  switch (rank) {
    case 1:
      if (rules.upOrDown || suit.reversed) return 1;
      return rules.scarceOnes ? 2 : 3;
    case 5:
      return suit.reversed ? 3 : 1;
    case START_RANK:
      return rules.upOrDown ? 1 : 0;
    default:
      return 2;
  }
}

/**
 * Ports `getVariantClueColors`: the variant's own list where it names one (only
 * Color Mute does, naming none), otherwise each suit's colours in suit order,
 * deduplicated. Suits every colour touches contribute nothing — Rainbow does not
 * add a sixth button.
 */
function clueColorsOf(suits: readonly SuitDef[], rules: RuleSet): ClueColor[] {
  const names: string[] = [];
  if (rules.clueColors !== null) {
    names.push(...rules.clueColors);
  } else {
    for (const suit of suits) {
      if (suit.allClueColors) continue;
      for (const name of suit.clueColors) if (!names.includes(name)) names.push(name);
    }
  }
  return names.map((name) => ({ name, fill: fillByColor.get(name) ?? "#888888" }));
}

function uniqueAbbreviations(suits: readonly SuitDef[]): string[] {
  const used = new Set<string>();
  return suits.map((suit) => {
    const candidates = [suit.abbr, ...suit.name.replace(/[^A-Za-z]/g, "").toUpperCase()];
    const pick = candidates.find((c) => !used.has(c)) ?? suit.abbr;
    used.add(pick);
    return pick;
  });
}

export function copiesOf(variant: Variant, identity: Identity): number {
  return variant.cardCounts[identity.suitIndex]?.[identity.rank] ?? 0;
}

/** Every distinct identity in the variant, in suit-then-rank order. */
export function allIdentities(variant: Variant): Identity[] {
  return variant.suits.flatMap((_, suitIndex) =>
    variant.ranks.map((rank) => ({ suitIndex, rank })),
  );
}

/** Whether a clue touches a card — the rule the analyser replays against. */
export function cardTouched(variant: Variant, identity: Identity, clue: Clue): boolean {
  const suit = variant.suits[identity.suitIndex];
  if (!suit) return false;
  return clue.kind === "color"
    ? touchedByColor(variant, suit, identity.rank, clue.value)
    : touchedByRank(variant, suit, identity, clue.value);
}

/** Ports `isCardTouchedByClueColor`. Branch order is load-bearing. */
function touchedByColor(
  variant: Variant,
  suit: SuitDef,
  rank: number,
  colorIndex: number,
): boolean {
  const rules = variant.rules;
  if (rules.colorCluesTouchNothing) return false;
  if (suit.allClueColors) return true;
  if (suit.noClueColors) return false;

  const color = variant.clueColors[colorIndex];
  if (!color) return false;

  // Synesthesia has no rank clues; a colour clue doubles as the rank it stands
  // for, on top of naming its own suits.
  if (rules.synesthesia && !suit.noClueRanks && prismColorIndex(variant, rank) === colorIndex) {
    return true;
  }

  if (rank === rules.specialRank) {
    if (rules.specialRankAllClueColors) return true;
    if (rules.specialRankNoClueColors) return false;
  }

  if (suit.prism) return prismColorIndex(variant, rank) === colorIndex;

  return suit.clueColors.includes(color.name);
}

/** Which colour names a Prism card: its rank, wrapping, with START taking the last. */
function prismColorIndex(variant: Variant, rank: number): number {
  const count = variant.clueColors.length;
  if (count === 0) return -1;
  return rank === START_RANK ? count - 1 : (rank - 1) % count;
}

/** Ports `isCardTouchedByClueRank`. Branch order is load-bearing. */
function touchedByRank(
  variant: Variant,
  suit: SuitDef,
  identity: Identity,
  clueRank: number,
): boolean {
  const rules = variant.rules;
  if (rules.rankCluesTouchNothing) return false;
  if (suit.allClueRanks) return true;
  if (suit.noClueRanks) return false;

  // Funnels pour downwards and chimneys upwards: one clue takes a whole range.
  if (rules.funnels) return identity.rank <= clueRank;
  if (rules.chimneys) return identity.rank >= clueRank;

  // Odds and Evens has two rank clues standing for parity, not for a number.
  if (rules.oddsAndEvens) {
    return clueRank === 1 ? identity.rank % 2 === 1 : identity.rank % 2 === 0;
  }

  if (identity.rank === rules.specialRank) {
    if (rules.specialRankAllClueRanks) return true;
    if (rules.specialRankNoClueRanks) return false;
    // A deceptive card answers to a rank picked by its suit, never its own.
    if (rules.specialRankDeceptive) {
      const index = identity.suitIndex % variant.clueRanks.length;
      return clueRank === variant.clueRanks[index];
    }
  }

  return clueRank === identity.rank;
}

export function suitAbbreviation(variant: Variant, suitIndex: number): string {
  return variant.abbreviations[suitIndex] ?? "?";
}

/** How a rank reads on a card face: START cards show an `S`. */
export function rankLabel(rank: number): string {
  if (rank === START_RANK) return "S";
  return rank < 0 ? "?" : String(rank);
}

/** Short human name for a card, e.g. `r3`, matching the transcript shorthand. */
export function identityName(variant: Variant, identity: Identity): string {
  if (identity.suitIndex < 0 || identity.rank < 0) return "??";
  return `${suitAbbreviation(variant, identity.suitIndex).toLowerCase()}${rankLabel(identity.rank)}`;
}

/**
 * What a clue is called out loud. Cow & Pig and Duck players may only moo, oink
 * or quack, and Odds and Evens numbers stand for parity.
 */
export function clueName(variant: Variant, clue: Clue): string {
  const rules = variant.rules;
  if (rules.duck) return "Quack";
  if (rules.cowAndPig) return clue.kind === "color" ? "Moo" : "Oink";
  if (clue.kind === "color") return variant.clueColors[clue.value]?.name ?? `colour ${clue.value}`;
  if (rules.oddsAndEvens) return clue.value === 1 ? "Odd" : "Even";
  return String(clue.value);
}

/**
 * Whether the clue's value reaches the player it is aimed at. Under Cow & Pig
 * and Duck a clue still points at cards, but which colour or number it was
 * stays with the giver, so the receiver learns only "these, and not those".
 */
export function clueValueIsPublic(variant: Variant): boolean {
  return !variant.rules.cowAndPig && !variant.rules.duck;
}

/**
 * The rules that make a variant unusual, in plain words.
 *
 * Names like "Chimneys & Dark Omni (4 Suits)" say what the variant is called but
 * not what it does, and there are now enough of them that nobody has them all
 * memorised. Empty for an ordinary variant.
 */
export function variantNotes(variant: Variant): string[] {
  const r = variant.rules;
  const notes: string[] = [];
  const rank = (n: number) => rankLabel(n);

  if (r.upOrDown) notes.push("stacks start at 1, 5 or a START card and run either way");
  if (r.sudoku) notes.push(`each stack starts on a different rank and wraps, ${r.stackSize} cards high`);
  if (variant.suits.some((suit) => suit.reversed)) notes.push("reversed suits run 5 down to 1");
  if (r.clueStarved) notes.push("a discard is worth half a clue");
  if (r.alternatingClues) notes.push("clue types must alternate");
  if (r.throwItInAHole) notes.push("plays go face down and the score stays hidden");
  if (r.cowAndPig) notes.push("clues are given as “moo” and “oink”");
  if (r.duck) notes.push("every clue is “quack”");
  if (r.colorCluesTouchNothing) notes.push("colour clues touch nothing");
  if (r.rankCluesTouchNothing) notes.push("rank clues touch nothing");
  if (variant.clueColors.length === 0 && !r.colorCluesTouchNothing) notes.push("no colour clues");
  if (variant.clueRanks.length === 0 && !r.rankCluesTouchNothing) notes.push("no rank clues");
  if (r.synesthesia) notes.push("a colour clue also names the matching rank");
  if (r.oddsAndEvens) notes.push("rank clues name odd or even");
  if (r.funnels) notes.push("a rank clue touches that rank and everything below");
  if (r.chimneys) notes.push("a rank clue touches that rank and everything above");
  if (r.criticalRank) notes.push(`only one ${rank(r.criticalRank)} of each suit`);
  if (r.scarceOnes) notes.push("only two 1s of each suit");

  if (r.specialRank && r.specialRankDeceptive) {
    notes.push(`${rank(r.specialRank)}s answer to a rank clue chosen by their suit, never their own`);
  } else if (r.specialRank) {
    const what = [
      r.specialRankAllClueColors && "every colour",
      r.specialRankNoClueColors && "no colour",
      r.specialRankAllClueRanks && "every rank",
      r.specialRankNoClueRanks && "no rank",
    ]
      .filter(Boolean)
      .join(" and ");
    notes.push(`${rank(r.specialRank)}s are touched by ${what}`);
  }

  return notes;
}

/** Variant names matching a search box, cheap enough to run on every keystroke. */
export function searchVariants(query: string, limit = 60): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return VARIANT_NAMES.slice(0, limit);
  const words = needle.split(/\s+/);
  const matches: string[] = [];
  for (const name of VARIANT_NAMES) {
    const haystack = name.toLowerCase();
    if (words.every((word) => haystack.includes(word))) {
      matches.push(name);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
