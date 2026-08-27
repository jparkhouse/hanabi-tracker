/**
 * Replays `deck` + `actions` into a full game state.
 *
 * Nothing else in the app mutates game state: recording a turn appends to the
 * record and the whole game is replayed. Games are at most a couple of hundred
 * actions, so this is cheap, and it buys exact undo and history scrubbing.
 *
 * Most variants only change which cards a clue touches, which `variants.ts`
 * handles alone. The ones that reach in here change what *playing* means:
 * Reversed suits run 5 down to 1, Up or Down lets each suit choose its
 * direction, and Sudoku lets each stack start anywhere and wrap. So a stack is
 * not "the highest rank played" any more — it is a list of cards with a
 * direction, and `nextPlayableRanks` is the only thing that decides what plays.
 */
import {
  ActionType,
  EndCondition,
  MAX_CLUE_TOKENS,
  MAX_STRIKES,
  UNKNOWN,
  handSize,
  isKnown,
  type Clue,
  type ClueKind,
  type GameAction,
  type GameOptions,
  type GameRecord,
  type Identity,
} from "./types";
import {
  START_RANK,
  cardTouched,
  clueName,
  clueValueIsPublic,
  getVariant,
  identityName,
  type Variant,
} from "./variants";

export type CardLocation = "hand" | "played" | "discarded";

/** Which way a suit's stack runs. `undecided` only happens in Up or Down. */
export type StackDirection = "undecided" | "up" | "down" | "finished";

export interface CardKnowledge {
  /** Colour clue indices that touched this card. */
  positiveColors: number[];
  negativeColors: number[];
  positiveRanks: number[];
  negativeRanks: number[];
  clued: boolean;
}

export interface CardState {
  order: number;
  identity: Identity;
  location: CardLocation;
  /** Seat holding the card, or -1 once it has left a hand. */
  holder: number;
  /** 1-based slot while in a hand (1 = newest), else 0. */
  slot: number;
  /** Seat that drew it, for the "who drew this" hint in the discard pile. */
  drawnBy: number;
  /** True when it left the hand as a misplay rather than a discard. */
  failed: boolean;
  knowledge: CardKnowledge;
}

export type LogKind = "play" | "bomb" | "discard" | "clue" | "end";

export interface LogEntry {
  /** Index into `actions`. */
  actionIndex: number;
  turn: number;
  playerIndex: number;
  kind: LogKind;
  text: string;
}

export interface GameState {
  players: readonly string[];
  ourPlayerIndex: number;
  variant: Variant;
  options: GameOptions;
  /** Orders per seat; index 0 is slot 1, the newest card. */
  hands: number[][];
  /** Indexed by order. */
  cards: CardState[];
  /**
   * Last rank played per suit; 0 means nothing played. In an ordinary variant
   * this is the top of the stack, but under Up or Down or Sudoku the stack may
   * be running downwards or wrapping, so never infer the next play from it —
   * ask `nextPlayableRanks`.
   */
  playStacks: number[];
  /** Orders played per suit, oldest first. Its length is the suit's score. */
  playStackOrders: number[][];
  playStackDirections: StackDirection[];
  /** Rank each Sudoku stack began at, or null while it is still unstarted. */
  playStackStarts: (number | null)[];
  /** Orders in the discard pile, oldest first. */
  discards: number[];
  /** Whole tokens; Clue Starved games move in halves. */
  clueTokens: number;
  /** Kind of the last clue given, for Alternating Clues. */
  lastClueKind: ClueKind | null;
  strikes: number;
  score: number;
  maxScore: number;
  /** 1-based; equals the number of actions replayed plus one. */
  turn: number;
  currentPlayerIndex: number;
  /** Cards still undrawn. */
  cardsRemaining: number;
  /** Turns left once the deck is empty, or null before that. */
  finalRoundLeft: number | null;
  finished: boolean;
  endCondition: number;
  log: LogEntry[];
}

export interface ReplayInput {
  players: readonly string[];
  ourPlayerIndex: number;
  variant: Variant;
  deck: readonly Identity[];
  actions: readonly GameAction[];
  touchedByAction: Readonly<Record<number, number[]>>;
  options: GameOptions;
}

function emptyKnowledge(): CardKnowledge {
  return {
    positiveColors: [],
    negativeColors: [],
    positiveRanks: [],
    negativeRanks: [],
    clued: false,
  };
}

export function clueOf(action: GameAction): Clue | null {
  if (action.type === ActionType.ColorClue) return { kind: "color", value: action.value };
  if (action.type === ActionType.RankClue) return { kind: "rank", value: action.value };
  return null;
}

/** A discard is worth half a token in Clue Starved games. */
function discardTokenValue(variant: Variant): number {
  return variant.rules.clueStarved ? 0.5 : 1;
}

/**
 * Replays a game.
 *
 * @param through How many actions to apply; used by the history scrubber.
 */
export function replay(input: ReplayInput, through = Number.POSITIVE_INFINITY): GameState {
  const { players, variant, deck, actions, touchedByAction, options } = input;
  const numPlayers = players.length;
  const cardsPerHand = handSize(numPlayers);

  const state: GameState = {
    players,
    ourPlayerIndex: input.ourPlayerIndex,
    variant,
    options,
    hands: Array.from({ length: numPlayers }, () => []),
    cards: [],
    playStacks: variant.suits.map(() => 0),
    playStackOrders: variant.suits.map(() => []),
    playStackDirections: variant.suits.map((suit) =>
      variant.rules.upOrDown ? "undecided" : suit.reversed ? "down" : "up",
    ),
    playStackStarts: variant.suits.map(() => null),
    discards: [],
    clueTokens: MAX_CLUE_TOKENS,
    lastClueKind: null,
    strikes: 0,
    score: 0,
    maxScore: variant.maxScore,
    turn: 1,
    currentPlayerIndex: 0,
    cardsRemaining: variant.totalCards,
    finalRoundLeft: null,
    finished: false,
    endCondition: EndCondition.InProgress,
    log: [],
  };

  let nextOrder = 0;

  const draw = (playerIndex: number): void => {
    if (nextOrder >= variant.totalCards) return;
    const order = nextOrder++;
    state.cards[order] = {
      order,
      identity: deck[order] ?? UNKNOWN,
      location: "hand",
      holder: playerIndex,
      slot: 1,
      drawnBy: playerIndex,
      failed: false,
      knowledge: emptyKnowledge(),
    };
    state.hands[playerIndex].unshift(order);
    state.cardsRemaining = variant.totalCards - nextOrder;
  };

  // hanab.live deals one full hand at a time, so seat 0 owns orders 0..handSize-1.
  for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
    for (let i = 0; i < cardsPerHand; i++) draw(playerIndex);
  }

  const removeFromHand = (playerIndex: number, order: number): number => {
    const hand = state.hands[playerIndex];
    const index = hand.indexOf(order);
    if (index === -1) return 0;
    hand.splice(index, 1);
    return index + 1;
  };

  const gainToken = (amount: number): void => {
    state.clueTokens = Math.min(MAX_CLUE_TOKENS, state.clueTokens + amount);
  };

  const limit = Math.min(actions.length, through);
  for (let actionIndex = 0; actionIndex < limit; actionIndex++) {
    if (state.finished) break;
    const action = actions[actionIndex];
    const actor = state.currentPlayerIndex;
    let drew = false;

    switch (action.type) {
      case ActionType.Play:
      case ActionType.Discard: {
        const card = state.cards[action.target];
        if (!card) break;
        const slot = removeFromHand(actor, action.target);
        card.holder = -1;
        card.slot = 0;

        const isPlay = action.type === ActionType.Play;
        const playable = isKnown(card.identity) && isPlayable(state, card.identity);

        if (isPlay && playable) {
          placeOnStack(state, card.order, card.identity);
          card.location = "played";
          // A finished stack returns a token — which is what "playing a 5" really
          // means, and stops meaning it the moment stacks can run downwards.
          const suitIndex = card.identity.suitIndex;
          if (
            state.playStackDirections[suitIndex] === "finished" &&
            !variant.rules.throwItInAHole
          ) {
            gainToken(1);
          }
        } else if (isPlay && isKnown(card.identity)) {
          state.strikes++;
          card.location = "discarded";
          card.failed = true;
          state.discards.push(card.order);
        } else if (isPlay) {
          // Identity never recorded: keep replaying rather than guessing a strike.
          card.location = "played";
        } else {
          card.location = "discarded";
          state.discards.push(card.order);
          gainToken(discardTokenValue(variant));
        }

        state.log.push({
          actionIndex,
          turn: state.turn,
          playerIndex: actor,
          kind: isPlay ? (playable ? "play" : "bomb") : "discard",
          text: `${players[actor]} ${
            isPlay ? (playable ? "plays" : "misplays") : "discards"
          } ${identityName(variant, card.identity)} (slot ${slot})`,
        });

        if (state.cardsRemaining > 0) {
          draw(actor);
          drew = true;
        }
        break;
      }

      case ActionType.ColorClue:
      case ActionType.RankClue: {
        const clue = clueOf(action)!;
        state.clueTokens = Math.max(0, state.clueTokens - 1);
        state.lastClueKind = clue.kind;
        const touched = touchedOrders(state, action.target, clue, touchedByAction[actionIndex]);
        applyClue(state, action.target, clue, touched);
        state.log.push({
          actionIndex,
          turn: state.turn,
          playerIndex: actor,
          kind: "clue",
          text: `${players[actor]} clues ${clueName(variant, clue)} to ${players[action.target]} (${
            touched.length
          } card${touched.length === 1 ? "" : "s"})`,
        });
        break;
      }

      case ActionType.EndGame: {
        state.finished = true;
        state.endCondition = action.value;
        state.log.push({
          actionIndex,
          turn: state.turn,
          playerIndex: action.target,
          kind: "end",
          text: `${players[action.target] ?? "Someone"} ended the game`,
        });
        break;
      }
    }

    if (!state.finished) {
      if (state.strikes >= MAX_STRIKES) {
        state.finished = true;
        state.endCondition = EndCondition.Strikeout;
      } else if (state.score >= state.maxScore) {
        state.finished = true;
        state.endCondition = EndCondition.Normal;
      } else if (state.finalRoundLeft !== null) {
        state.finalRoundLeft--;
        if (state.finalRoundLeft <= 0) {
          state.finished = true;
          state.endCondition = EndCondition.Normal;
        }
      } else if (drew && state.cardsRemaining === 0) {
        // Everyone, including whoever took the last card, gets one more turn.
        state.finalRoundLeft = numPlayers;
      }
    }

    state.currentPlayerIndex = (actor + 1) % numPlayers;
    state.turn++;
  }

  for (const hand of state.hands) {
    hand.forEach((order, index) => {
      const card = state.cards[order];
      if (card) card.slot = index + 1;
    });
  }

  return state;
}

/** Adds a card to its stack and re-reads the stack's direction from the result. */
function placeOnStack(state: GameState, order: number, identity: Identity): void {
  const { suitIndex, rank } = identity;
  const stack = state.playStackOrders[suitIndex];
  stack.push(order);
  state.playStacks[suitIndex] = rank;
  state.score++;
  if (state.playStackStarts[suitIndex] === null) state.playStackStarts[suitIndex] = rank;
  state.playStackDirections[suitIndex] = directionOf(state, suitIndex);
}

/**
 * Ports hanab.live's `getStackDirection`.
 *
 * Only Up or Down has to work anything out: a stack whose top is a START card,
 * or which is empty, could still go either way. The 3 case is the one that needs
 * the second card — 1,2,3 and 5,4,3 both leave a 3 on top of three cards.
 */
function directionOf(state: GameState, suitIndex: number): StackDirection {
  const variant = state.variant;
  const stack = state.playStackOrders[suitIndex];
  if (stack.length === variant.stackSize) return "finished";
  if (!variant.rules.upOrDown) {
    return variant.suits[suitIndex]?.reversed ? "down" : "up";
  }

  const top = state.playStacks[suitIndex];
  if (top === 0 || top === START_RANK) return "undecided";
  if (top !== stack.length) return "down";
  if (top !== 3) return "up";
  const second = state.cards[stack[1]]?.identity.rank;
  return second === 2 ? "up" : "down";
}

/**
 * Which ranks could be played onto a suit right now. Usually one, but an
 * untouched Up or Down suit accepts a 1, a 5 or a START, and an unstarted Sudoku
 * suit accepts any rank no other suit has claimed.
 *
 * Ports hanab.live's `getNextPlayableRanks`.
 */
export function nextPlayableRanks(state: GameState, suitIndex: number): number[] {
  const variant = state.variant;
  const top = state.playStacks[suitIndex] ?? 0;
  const started = top !== 0;

  switch (state.playStackDirections[suitIndex]) {
    case "finished":
      return [];

    case "undecided":
      return top === START_RANK ? [2, 4] : [1, 5, START_RANK];

    case "down":
      return started ? [top - 1] : [5];

    case "up": {
      if (!variant.rules.sudoku) return started ? [top + 1] : [1];
      // Sudoku stacks wrap: after 5 comes 1 again, until the stack is full.
      if (started) return [(top % variant.stackSize) + 1];
      const start = state.playStackStarts[suitIndex];
      if (start !== null) return [start];
      // Every suit must start on a different rank, so the taken ones are out.
      return variant.ranks.filter((rank) => !state.playStackStarts.includes(rank));
    }
  }
}

/** Whether this exact card would play right now. */
export function isPlayable(state: GameState, identity: Identity): boolean {
  return nextPlayableRanks(state, identity.suitIndex).includes(identity.rank);
}

/** Whether a rank is already sitting on its suit's stack. */
export function isOnStack(state: GameState, identity: Identity): boolean {
  const { suitIndex, rank } = identity;
  const top = state.playStacks[suitIndex] ?? 0;
  if (top === 0) return false;
  // A stack that only ever runs one way covers a contiguous range, so the top
  // rank answers this without walking the cards.
  if (!state.variant.rules.upOrDown && !state.variant.rules.sudoku) {
    return state.variant.suits[suitIndex]?.reversed ? rank >= top : rank <= top;
  }
  return (state.playStackOrders[suitIndex] ?? []).some(
    (order) => state.cards[order]?.identity.rank === rank,
  );
}

/**
 * Which orders a clue touched.
 *
 * Derived from the deck where we know the cards. For clues aimed at our own
 * hidden hand there is nothing to derive from, so the recorder's tap-selection
 * (`override`) is authoritative.
 */
export function touchedOrders(
  state: GameState,
  target: number,
  clue: Clue,
  override?: readonly number[],
): number[] {
  const hand = state.hands[target] ?? [];
  if (override) return hand.filter((order) => override.includes(order));
  return hand.filter((order) => {
    const card = state.cards[order];
    return card !== undefined && isKnown(card.identity) && cardTouched(state.variant, card.identity, clue);
  });
}

function applyClue(state: GameState, target: number, clue: Clue, touched: readonly number[]): void {
  // Under Cow & Pig and Duck the giver may only moo, oink or quack, so the cards
  // are pointed at but the colour or number behind the gesture never lands.
  const learnsValue = clueValueIsPublic(state.variant);
  for (const order of state.hands[target] ?? []) {
    const knowledge = state.cards[order]?.knowledge;
    if (!knowledge) continue;
    const hit = touched.includes(order);
    if (hit) knowledge.clued = true;
    if (!learnsValue) continue;
    const list =
      clue.kind === "color"
        ? hit
          ? knowledge.positiveColors
          : knowledge.negativeColors
        : hit
          ? knowledge.positiveRanks
          : knowledge.negativeRanks;
    if (!list.includes(clue.value)) list.push(clue.value);
  }
}

/** Replays a stored game. */
export function stateOf(record: GameRecord, through?: number): GameState {
  return replay(
    {
      players: record.players,
      ourPlayerIndex: record.ourPlayerIndex,
      variant: getVariant(record.variantName),
      deck: record.deck,
      actions: record.actions,
      touchedByAction: record.touchedByAction,
      options: record.options,
    },
    through,
  );
}

/** Orders that would be touched, for previewing a clue before recording it. */
export function previewClue(state: GameState, target: number, clue: Clue): number[] {
  return touchedOrders(state, target, clue);
}

export function canGiveClue(state: GameState): boolean {
  return !state.finished && state.clueTokens >= 1 && allowedClueKinds(state).length > 0;
}

/**
 * Which kinds of clue may be given. Alternating Clues forbids repeating the last
 * one, and the Mute and Blind variants remove a kind altogether.
 */
export function allowedClueKinds(state: GameState): ClueKind[] {
  const variant = state.variant;
  const kinds: ClueKind[] = [];
  if (variant.clueColors.length > 0) kinds.push("color");
  if (variant.clueRanks.length > 0) kinds.push("rank");
  if (!variant.rules.alternatingClues || state.lastClueKind === null) return kinds;
  const required: ClueKind = state.lastClueKind === "color" ? "rank" : "color";
  return kinds.filter((kind) => kind === required);
}

export function canDiscard(state: GameState): boolean {
  return !state.finished && state.clueTokens < MAX_CLUE_TOKENS;
}

/** `7½`, for the half-tokens a Clue Starved discard earns. */
export function clueTokenLabel(tokens: number): string {
  const whole = Math.floor(tokens);
  const half = tokens - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? "½" : `${whole}½`;
}

/** hanab.live's pace: how many discards are left before the max score slips away. */
export function pace(state: GameState): number {
  return state.score + state.cardsRemaining + state.players.length - state.maxScore;
}

/** How many copies of an identity have already been discarded or misplayed. */
export function discardedCopies(state: GameState, identity: Identity): number {
  let count = 0;
  for (const order of state.discards) {
    const card = state.cards[order];
    if (
      card &&
      card.identity.suitIndex === identity.suitIndex &&
      card.identity.rank === identity.rank
    ) {
      count++;
    }
  }
  return count;
}

/** True when every copy of an identity is gone, so its suit is capped below it. */
export function isDead(state: GameState, identity: Identity): boolean {
  const total = state.variant.cardCounts[identity.suitIndex]?.[identity.rank] ?? 0;
  return discardedCopies(state, identity) >= total;
}

/** Ranks of a suit with no copies left anywhere. */
function allDiscardedRanks(state: GameState, suitIndex: number): Set<number> {
  const gone = new Set<number>();
  for (const rank of state.variant.ranks) {
    if (isDead(state, { suitIndex, rank })) gone.add(rank);
  }
  return gone;
}

/**
 * Whether a card is still worth something — i.e. some line of play still reaches
 * it. Ports hanab.live's `reversibleGetRanksUsefulForMaxScore` and
 * `sudokuIsCardNeededForMaxScore`, plus the ordinary walk-up for everything else.
 */
function isNeededForMaxScore(state: GameState, identity: Identity): boolean {
  const { suitIndex, rank } = identity;
  const variant = state.variant;
  const direction = state.playStackDirections[suitIndex];
  if (direction === "finished") return false;

  // Ordinary suit: reachable as long as nothing between the stack and it is gone.
  // Kept off the general path because this runs per candidate identity.
  if (!variant.rules.sudoku && !variant.rules.upOrDown && !variant.suits[suitIndex]?.reversed) {
    for (let between = (state.playStacks[suitIndex] ?? 0) + 1; between < rank; between++) {
      if (isDead(state, { suitIndex, rank: between })) return false;
    }
    return true;
  }

  const gone = allDiscardedRanks(state, suitIndex);
  if (variant.rules.sudoku) return sudokuNeeded(state, suitIndex, rank, gone);
  return usefulRanks(variant, state.playStacks[suitIndex] || null, gone, direction).has(rank);
}

/** Ports `reversibleGetRanksUsefulForMaxScore`. */
function usefulRanks(
  variant: Variant,
  lastPlayed: number | null,
  gone: ReadonlySet<number>,
  direction: StackDirection,
): Set<number> {
  if (direction === "finished") return new Set();
  if (direction === "undecided") {
    return new Set([
      ...usefulRanks(variant, lastPlayed, gone, "up"),
      ...usefulRanks(variant, lastPlayed, gone, "down"),
    ]);
  }

  const ranks = new Set<number>();
  const up = direction === "up";
  const first = up ? 1 : variant.stackSize;
  const canStart = variant.rules.upOrDown
    ? !(gone.has(START_RANK) && gone.has(first))
    : !gone.has(first);
  if (!canStart) return ranks;

  let next = up ? 2 : variant.stackSize - 1;
  if (lastPlayed === null) {
    ranks.add(first);
    if (variant.rules.upOrDown) ranks.add(START_RANK);
  } else if (lastPlayed !== START_RANK) {
    next = up ? lastPlayed + 1 : lastPlayed - 1;
  }

  for (let rank = next; up ? rank <= variant.stackSize : rank >= 1; up ? rank++ : rank--) {
    if (gone.has(rank)) break;
    ranks.add(rank);
  }
  return ranks;
}

/**
 * Ports `sudokuIsCardNeededForMaxScore`: a card is needed if some start rank the
 * stack could still take leaves a run long enough to reach it.
 */
function sudokuNeeded(
  state: GameState,
  suitIndex: number,
  rank: number,
  gone: ReadonlySet<number>,
): boolean {
  const variant = state.variant;
  const maxRun = sudokuRunLengths(variant, gone);
  const start = state.playStackStarts[suitIndex];
  const possibleStarts =
    start !== null
      ? [start]
      : variant.ranks.filter((candidate) => !state.playStackStarts.includes(candidate));

  return possibleStarts.some((from) => {
    const distance = (rank - from + variant.stackSize) % variant.stackSize;
    return (maxRun[from - 1] ?? 0) > distance;
  });
}

/** Ports `sudokuWalkUpAll`: the longest run still playable from each start rank. */
function sudokuRunLengths(variant: Variant, gone: ReadonlySet<number>): number[] {
  const runs = new Array<number>(variant.stackSize).fill(variant.stackSize);
  let lastDead = 0;

  for (const rank of variant.ranks) {
    if (!gone.has(rank)) continue;
    for (let from = lastDead + 1; from < rank; from++) runs[from - 1] = rank - from;
    runs[rank - 1] = 0;
    lastDead = rank;
  }

  if (lastDead === 0) return runs;
  // Runs starting above the last dead rank wrap around through 1.
  for (let from = lastDead + 1; from <= variant.stackSize; from++) {
    runs[from - 1] = Math.min(runs[0] + variant.stackSize + 1 - from, variant.stackSize);
  }
  return runs;
}

/**
 * True when one copy is left and the suit still needs it.
 *
 * Up or Down complicates this: while a suit's direction is undecided its 1, 5 and
 * START are interchangeable, so a single copy only becomes critical once one of
 * the three is gone. Ports `reversibleIsCardCritical`.
 */
export function isCritical(state: GameState, identity: Identity): boolean {
  const total = state.variant.cardCounts[identity.suitIndex]?.[identity.rank] ?? 0;
  const lastCopy = total - discardedCopies(state, identity) === 1;
  if (!lastCopy) return false;
  if (!isNeededForMaxScore(state, identity)) return false;
  if (isOnStack(state, identity)) return false;
  if (!state.variant.rules.upOrDown) return true;

  const { suitIndex, rank } = identity;
  const direction = state.playStackDirections[suitIndex];
  if ((rank === 1 || rank === state.variant.stackSize || rank === START_RANK) && direction === "undecided") {
    return (
      isDead(state, { suitIndex, rank: START_RANK }) ||
      isDead(state, { suitIndex, rank: 1 }) ||
      isDead(state, { suitIndex, rank: state.variant.stackSize })
    );
  }
  if (rank === 1) return direction === "down";
  if (rank === state.variant.stackSize) return direction === "up";
  return true;
}

export type IdentityStatus = "playable" | "played" | "dead" | "later";

/** Where an identity stands against the board as it is now. */
export function identityStatus(state: GameState, identity: Identity): IdentityStatus {
  if (isOnStack(state, identity)) return "played";
  if (isPlayable(state, identity)) return "playable";
  return isNeededForMaxScore(state, identity) ? "later" : "dead";
}
