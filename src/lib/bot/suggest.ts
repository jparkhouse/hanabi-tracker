/**
 * What the bot would do on your turn, and what each option is worth.
 *
 * Values are on one deliberate scale: **expected points**. A certain play is
 * worth about 1.0 because it puts one card on a stack; a clue is worth the
 * plays it sets up, discounted; a discard is worth the clue it buys minus what
 * it throws away. That makes the numbers comparable and, more importantly,
 * explainable — every suggestion carries the reasons that produced its number.
 *
 * This is one ply deep. scala-bot searches forward through the rest of the
 * round before scoring; here the tree is not walked, so a clue whose payoff is
 * two turns away is undervalued. The reasons list is the honest part: read it
 * rather than trusting the decimal.
 */
import { canDiscard, canGiveClue, type GameState } from "../hanabi/engine";
import { MAX_CLUE_TOKENS, isKnown, type Clue, type GameRecord } from "../hanabi/types";
import { cardTouched, clueName, identityName, RANKS } from "../hanabi/variants";
import {
  chopOf,
  criticalOrds,
  handOrders,
  hypoStacks,
  identityOfOrd,
  ordOf,
  playableOrds,
  possibilities,
  trashOrds,
  type Ord,
  type Thought,
} from "./empathy";
import { hypotheticalClue, type BotAnalysis, type ClueInterp } from "./hgroup";
import { isKnownTrash } from "./notes";

export type BotMove =
  | { kind: "play"; order: number }
  | { kind: "discard"; order: number }
  | { kind: "clue"; target: number; clue: Clue };

export interface Suggestion {
  move: BotMove;
  value: number;
  /** Short imperative label, e.g. "Play slot 2". */
  label: string;
  /** What the convention reading is, e.g. "play clue, through finesse r1". */
  detail: string;
  /** Line-by-line arithmetic behind the value. */
  reasons: string[];
  /** True when the move can backfire — a play that is not certain, mostly. */
  risky: boolean;
}

/** Cost of a strike: a wasted card, a lost tempo, and a third of a lost game. */
const STRIKE_COST = 1.6;
const CLUE_TOKEN_VALUE = 0.25;

function slotOf(state: GameState, order: number): number {
  return state.cards[order]?.slot ?? 0;
}

function fmt(value: number): string {
  return (value >= 0 ? "+" : "") + value.toFixed(2);
}

/** Chance each identity in the pool is the real card, treated as uniform. */
function chanceOf(pool: ReadonlySet<Ord>, subset: ReadonlySet<Ord>): number {
  if (pool.size === 0) return 0;
  let hits = 0;
  for (const ord of pool) if (subset.has(ord)) hits++;
  return hits / pool.size;
}

function evaluatePlay(analysis: BotAnalysis, order: number): Suggestion | undefined {
  const { state, thoughts } = analysis;
  const thought = thoughts.get(order);
  if (!thought) return undefined;

  const pool = possibilities(thought);
  const playable = playableOrds(state);
  const chance = chanceOf(pool, playable);
  if (chance === 0) return undefined;

  // A card nobody has said anything about is a pure guess. Listing four of them
  // at identical odds is noise, so they only appear when the guess is a real
  // one — which is what an endgame gamble looks like.
  const informed = thought.status !== "none" || state.cards[order]?.knowledge.clued === true;
  if (!informed && chance < 0.5) return undefined;

  const reasons: string[] = [];
  let value = chance;
  reasons.push(
    chance === 1
      ? "certain to play (+1.00)"
      : `${Math.round(chance * 100)}% to be playable (${fmt(chance)})`,
  );

  if (chance < 1) {
    const risk = (1 - chance) * STRIKE_COST;
    value -= risk;
    reasons.push(`${Math.round((1 - chance) * 100)}% to strike (${fmt(-risk)})`);
  }

  // A played 5 hands a clue token back, if there is room for it.
  const fives = new Set([...pool].filter((ord) => identityOfOrd(ord).rank === 5));
  const fiveChance = chanceOf(pool, fives);
  if (fiveChance > 0 && state.clueTokens < MAX_CLUE_TOKENS) {
    const bonus = fiveChance * CLUE_TOKEN_VALUE;
    value += bonus;
    reasons.push(`a 5 returns a clue token (${fmt(bonus)})`);
  }

  if (thought.status === "finessed") {
    value += 0.2;
    reasons.push("blind play the table is waiting on (+0.20)");
  } else if (thought.status === "called to play") {
    value += 0.1;
    reasons.push("clued to play (+0.10)");
  }

  const names = [...pool].map((ord) => identityName(state.variant, identityOfOrd(ord)));
  return {
    move: { kind: "play", order },
    value,
    label: `Play slot ${slotOf(state, order)}`,
    detail: names.length <= 5 ? names.join(", ") : `${names.length} candidates`,
    reasons,
    risky: chance < 1,
  };
}

function evaluateDiscard(analysis: BotAnalysis, order: number): Suggestion | undefined {
  const { state, thoughts } = analysis;
  const thought = thoughts.get(order);
  if (!thought) return undefined;

  const pool = possibilities(thought);
  const trash = trashOrds(state);
  const critical = criticalOrds(state);
  const reasons: string[] = [`buys a clue token (${fmt(CLUE_TOKEN_VALUE)})`];
  let value = CLUE_TOKEN_VALUE;

  const trashChance = chanceOf(pool, trash);
  const critChance = chanceOf(pool, critical);
  const usefulChance = 1 - trashChance;

  if (trashChance === 1) {
    reasons.push("known trash, nothing lost");
  } else {
    if (critChance > 0) {
      const cost = critChance * 1.5;
      value -= cost;
      reasons.push(
        critChance === 1
          ? `last copy — the suit stops here (${fmt(-cost)})`
          : `${Math.round(critChance * 100)}% to be the last copy (${fmt(-cost)})`,
      );
    }
    const plainLoss = (usefulChance - critChance) * 0.3;
    if (plainLoss > 0.005) {
      value -= plainLoss;
      reasons.push(`may still be wanted (${fmt(-plainLoss)})`);
    }
  }

  // The chop belongs to whoever holds the card, not to us.
  const holder = state.cards[order]?.holder ?? state.ourPlayerIndex;
  const isChop = chopOf(state, thoughts, holder) === order;
  return {
    move: { kind: "discard", order },
    value,
    label: `Discard slot ${slotOf(state, order)}`,
    detail: trashChance === 1 ? "known trash" : isChop ? "on chop" : "not on chop",
    reasons,
    risky: critChance > 0,
  };
}

/**
 * Cards the clue newly asks someone to play, and whether they really can.
 *
 * "Can" is measured against the stacks as they will stand once the promises
 * already outstanding have been kept, not as they stand now — a clue setting up
 * r3 behind an r2 somebody is already going to play is a good clue, and scoring
 * it against the bare stacks would call it a lie.
 */
function newPlayPromises(
  before: BotAnalysis,
  afterThoughts: Map<number, Thought>,
  after: GameState,
): { good: number[]; bad: number[]; blind: number[] } {
  const good: number[] = [];
  const bad: number[] = [];
  const blind: number[] = [];

  for (const [order, thought] of afterThoughts) {
    const previous = before.thoughts.get(order)?.status;
    const wasPromised = previous === "called to play" || previous === "finessed";
    const nowPromised = thought.status === "called to play" || thought.status === "finessed";
    if (wasPromised || !nowPromised) continue;

    const card = after.cards[order];
    if (!card) continue;
    if (!isKnown(card.identity)) {
      blind.push(order);
      continue;
    }
    // Excluding the card itself, or its own promise would vouch for it.
    const stacks = hypoStacks(after, afterThoughts, new Set([order]));
    const top = stacks[card.identity.suitIndex] ?? 0;
    if (top === card.identity.rank - 1) good.push(order);
    else bad.push(order);
    if (thought.status === "finessed") blind.push(order);
  }

  return { good, bad, blind };
}

function evaluateClue(
  record: GameRecord,
  analysis: BotAnalysis,
  target: number,
  clue: Clue,
): Suggestion | undefined {
  const { state } = analysis;
  const touched = handOrders(state, target).filter((order) => {
    const card = state.cards[order];
    return card && isKnown(card.identity) && cardTouched(state.variant, card.identity, clue);
  });
  if (touched.length === 0) return undefined;

  const { interp, thoughts: afterThoughts, after } = hypotheticalClue(record, analysis, target, clue);
  const reasons: string[] = [];
  let value = 0;

  const label = `Clue ${clueName(state.variant, clue)} to ${state.players[target]}`;

  if (interp.kind === "useless") {
    return {
      move: { kind: "clue", target, clue },
      value: -1,
      label,
      detail: interp.detail,
      reasons: ["says nothing the table did not already know (-1.00)"],
      risky: false,
    };
  }

  const { good, bad, blind } = newPlayPromises(analysis, afterThoughts, after);

  if (bad.length > 0) {
    const cost = bad.length * 2;
    value -= cost;
    const names = bad
      .map((order) => identityName(state.variant, after.cards[order]!.identity))
      .join(", ");
    reasons.push(`makes ${names} look playable when it is not (${fmt(-cost)})`);
  }

  for (const order of good) {
    const isBlind = blind.includes(order);
    const worth = isBlind ? 0.85 : 1;
    value += worth;
    const name = identityName(state.variant, after.cards[order]!.identity);
    reasons.push(`${isBlind ? "blind-plays" : "sets up"} ${name} (${fmt(worth)})`);
  }

  // Bad touch: a newly touched card that is really trash gets stuck in a hand.
  const trash = trashOrds(after);
  const newlyTouched = touched.filter((order) => !state.cards[order]?.knowledge.clued);
  const badTouched = newlyTouched.filter((order) => {
    const identity = after.cards[order]?.identity;
    return identity && isKnown(identity) && trash.has(ordOf(identity));
  });
  if (badTouched.length > 0) {
    const cost = badTouched.length * 0.6;
    value -= cost;
    reasons.push(`locks up ${badTouched.length} trash card(s) (${fmt(-cost)})`);
  }

  if (interp.kind === "save") {
    const focusIdentity = after.cards[interp.focus]?.identity;
    const critical = criticalOrds(state);
    const isCritical = focusIdentity && isKnown(focusIdentity) && critical.has(ordOf(focusIdentity));
    const worth = isCritical ? 1.4 : 0.5;
    value += worth;
    reasons.push(
      isCritical
        ? `saves the last ${identityName(state.variant, focusIdentity!)} from the chop (${fmt(worth)})`
        : `saves the chop (${fmt(worth)})`,
    );
  }

  if (interp.kind === "chop move") {
    value += 0.6;
    reasons.push(`${interp.detail} (${fmt(0.6)})`);
  }

  if (interp.kind === "fix") {
    value += 1.2;
    reasons.push("stops a misplay (+1.20)");
  }

  if (interp.kind === "unclear") {
    value -= 0.5;
    reasons.push("no convention reading fits this clue (-0.50)");
  }

  if (interp.kind === "stall") {
    // Not worthless — it buys a turn — but it is the move you make when there
    // is nothing to say, so it should never beat one that says something.
    value -= 0.2;
    reasons.push("says nothing; a stall (-0.20)");
  }

  // A clue with more than one reading leaves the table guessing which.
  if (interp.chosen.length > 1 && interp.kind === "play") {
    const cost = Math.min(interp.chosen.length - 1, 3) * 0.15;
    value -= cost;
    reasons.push(`${interp.chosen.length} readings — ambiguous (${fmt(-cost)})`);
  }

  // Good touch: fresh cards under a clue are worth something even without a play.
  const goodTouched = newlyTouched.length - badTouched.length;
  if (goodTouched > 0 && good.length === 0 && interp.kind !== "save") {
    const worth = Math.min(goodTouched, 4) * 0.12;
    value += worth;
    reasons.push(`touches ${goodTouched} new useful card(s) (${fmt(worth)})`);
  }

  // Information that narrows existing notes without touching anything new.
  let narrowed = 0;
  for (const [order, thought] of afterThoughts) {
    const wasSize = analysis.thoughts.get(order)?.inferred.size;
    if (wasSize !== undefined && thought.inferred.size < wasSize) narrowed++;
  }
  if (narrowed > 0) {
    const worth = Math.min(narrowed, 6) * 0.05;
    value += worth;
    reasons.push(`fills in ${narrowed} other note(s) (${fmt(worth)})`);
  }

  // Clues are not free, and the last one is dearer than the first.
  const tokenCost = state.clueTokens <= 2 ? 0.3 : 0.12;
  value -= tokenCost;
  reasons.push(`spends a clue token (${fmt(-tokenCost)})`);

  return {
    move: { kind: "clue", target, clue },
    value,
    label,
    detail: interp.detail,
    reasons,
    risky: bad.length > 0 || interp.kind === "unclear",
  };
}

/**
 * Every move worth considering on the current player's turn, best first.
 *
 * Only meaningful when it is our turn; the caller checks that.
 */
export function suggestMoves(record: GameRecord, analysis: BotAnalysis): Suggestion[] {
  // The scoring below is H-Group's, all the way down. On a variant the reader
  // stood down from there is nothing behind it, so it has nothing to say.
  if (analysis.unsupported) return [];
  const { state } = analysis;
  if (state.finished) return [];

  const seat = state.currentPlayerIndex;
  const suggestions: Suggestion[] = [];

  for (const order of handOrders(state, seat)) {
    const play = evaluatePlay(analysis, order);
    if (play) suggestions.push(play);
  }

  if (canDiscard(state)) {
    const thoughts = analysis.thoughts;
    const chop = chopOf(state, thoughts, seat);
    for (const order of handOrders(state, seat)) {
      const thought = thoughts.get(order);
      if (!thought) continue;
      // Only the chop and known trash are real candidates; the rest is noise.
      const trashy = isKnownTrash(state, thought);
      if (order !== chop && !trashy) continue;
      const discard = evaluateDiscard(analysis, order);
      if (discard) suggestions.push(discard);
    }
    if (chop === undefined && !suggestions.some((s) => s.move.kind === "discard")) {
      // Locked hand: nothing is a clean discard, so offer the least bad card.
      for (const order of handOrders(state, seat)) {
        const discard = evaluateDiscard(analysis, order);
        if (discard) suggestions.push(discard);
      }
    }
  }

  if (canGiveClue(state)) {
    for (let target = 0; target < state.players.length; target++) {
      if (target === seat) continue;
      for (let value = 0; value < state.variant.clueColors.length; value++) {
        const clue: Clue = { kind: "color", value };
        const suggestion = evaluateClue(record, analysis, target, clue);
        if (suggestion) suggestions.push(suggestion);
      }
      for (const rank of RANKS) {
        const clue: Clue = { kind: "rank", value: rank };
        const suggestion = evaluateClue(record, analysis, target, clue);
        if (suggestion) suggestions.push(suggestion);
      }
    }
  }

  return suggestions.sort((a, b) => b.value - a.value);
}

/** True when the bot can speak for this seat, i.e. it is the recorder's turn. */
export function isOurTurn(state: GameState): boolean {
  return !state.finished && state.currentPlayerIndex === state.ourPlayerIndex;
}

export type { ClueInterp };
