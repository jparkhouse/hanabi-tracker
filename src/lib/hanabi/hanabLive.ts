/**
 * hanab.live's export JSON: the format hanab.live's "import a game" page reads
 * and scala-bot's `replay`/`analyze` load with `file=`.
 *
 * ```json
 * {"id":0,"players":["a","b"],"deck":[{"suitIndex":4,"rank":4}, ...],
 *  "actions":[{"type":3,"target":2,"value":1}, ...],
 *  "notes":[[],[]],"options":{"variant":"No Variant"}}
 * ```
 *
 * `deck` is in deal order — seat 0's whole hand first, then seat 1's, then the
 * draw pile — and a play/discard action's `target` is an index into it. That is
 * exactly how `GameRecord` stores things, so exporting is a formatting step.
 */
import {
  UNKNOWN,
  handSize,
  isKnown,
  type GameAction,
  type GameRecord,
  type Identity,
} from "./types";
import {
  copiesOf,
  getVariant,
  rankLabel,
  variantExists,
  DEFAULT_VARIANT_NAME,
} from "./variants";

export interface HanabLiveGame {
  id: number;
  players: string[];
  deck: Identity[];
  actions: GameAction[];
  notes: string[][];
  options: {
    variant: string;
    deckPlays?: boolean;
    emptyClues?: boolean;
  };
}

export function toHanabLive(record: GameRecord): HanabLiveGame {
  const notes = record.players.map((): string[] => []);
  const ourNotes = Object.entries(record.notes)
    .map(([order, text]) => [Number(order), text] as const)
    .filter(([, text]) => text.trim() !== "");

  if (ourNotes.length > 0) {
    const length = Math.max(...ourNotes.map(([order]) => order)) + 1;
    const list = Array.from({ length }, () => "");
    for (const [order, text] of ourNotes) list[order] = text;
    notes[record.ourPlayerIndex] = list;
  }

  const options: HanabLiveGame["options"] = { variant: record.variantName };
  if (record.options.deckPlays) options.deckPlays = true;
  if (record.options.emptyClues) options.emptyClues = true;

  return {
    id: record.hanabLiveId ?? 0,
    players: [...record.players],
    deck: record.deck.map(({ suitIndex, rank }) => ({ suitIndex, rank })),
    actions: record.actions.map(({ type, target, value }) => ({ type, target, value })),
    notes,
    options,
  };
}

export function serialize(record: GameRecord): string {
  return JSON.stringify(toHanabLive(record));
}

export interface ExportIssue {
  severity: "error" | "warning";
  message: string;
}

/** Problems worth showing before someone uploads or analyses a game. */
export function exportIssues(record: GameRecord): ExportIssue[] {
  const issues: ExportIssue[] = [];

  if (!variantExists(record.variantName)) {
    issues.push({
      severity: "error",
      message: `Unknown variant "${record.variantName}".`,
    });
    return issues;
  }

  const unknown = record.deck.filter((card) => !isKnown(card)).length;
  if (unknown > 0) {
    issues.push({
      severity: "warning",
      message: `${unknown} card${unknown === 1 ? "" : "s"} still unidentified. scala-bot can replay from your seat, but hanab.live needs a complete deck.`,
    });
  }

  const variant = getVariant(record.variantName);
  const counts = new Map<string, number>();
  for (const card of record.deck) {
    if (!isKnown(card)) continue;
    const key = `${card.suitIndex}:${card.rank}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const [key, count] of counts) {
    const [suitIndex, rank] = key.split(":").map(Number);
    const allowed = copiesOf(variant, { suitIndex, rank });
    if (count > allowed) {
      issues.push({
        severity: "error",
        message: `${count} copies of ${variant.suits[suitIndex]?.display ?? "?"} ${rankLabel(rank)} recorded, but the variant only has ${allowed}.`,
      });
    }
  }

  if (record.deck.length > variant.totalCards) {
    issues.push({
      severity: "error",
      message: `${record.deck.length} cards recorded but the variant's deck holds ${variant.totalCards}.`,
    });
  }

  return issues;
}

export class ImportError extends Error {}

/**
 * Parses a hanab.live export back into a stored game, so a replay downloaded
 * from hanab.live (or exported from another device) can be reviewed here.
 */
export function fromHanabLive(
  json: unknown,
  { ourPlayerIndex = 0, title }: { ourPlayerIndex?: number; title?: string } = {},
): GameRecord {
  if (typeof json !== "object" || json === null) throw new ImportError("Not a JSON object.");
  const data = json as Record<string, unknown>;

  const players = data.players;
  if (!Array.isArray(players) || players.some((p) => typeof p !== "string")) {
    throw new ImportError("Missing a `players` array of names.");
  }
  if (players.length < 2 || players.length > 6) {
    throw new ImportError(`Unsupported player count: ${players.length}.`);
  }

  const rawDeck = data.deck;
  if (!Array.isArray(rawDeck)) throw new ImportError("Missing a `deck` array.");
  const deck: Identity[] = rawDeck.map((card, index) => {
    if (typeof card !== "object" || card === null) {
      throw new ImportError(`Deck entry ${index} is not a card.`);
    }
    const { suitIndex, rank } = card as Record<string, unknown>;
    if (typeof suitIndex !== "number" || typeof rank !== "number") {
      throw new ImportError(`Deck entry ${index} is missing suitIndex/rank.`);
    }
    return suitIndex < 0 || rank < 0 ? { ...UNKNOWN } : { suitIndex, rank };
  });

  const rawActions = data.actions;
  if (!Array.isArray(rawActions)) throw new ImportError("Missing an `actions` array.");
  const actions: GameAction[] = rawActions.map((action, index) => {
    if (typeof action !== "object" || action === null) {
      throw new ImportError(`Action ${index} is not an object.`);
    }
    const { type, target, value } = action as Record<string, unknown>;
    if (typeof type !== "number" || typeof target !== "number") {
      throw new ImportError(`Action ${index} is missing type/target.`);
    }
    return {
      type: type as GameAction["type"],
      target,
      value: typeof value === "number" ? value : 0,
    };
  });

  const rawOptions = (data.options ?? {}) as Record<string, unknown>;
  const variantName =
    typeof rawOptions.variant === "string" ? rawOptions.variant : DEFAULT_VARIANT_NAME;
  if (!variantExists(variantName)) {
    throw new ImportError(
      `Variant "${variantName}" is not one hanab.live offers, so it cannot be replayed here.`,
    );
  }

  if (deck.length < players.length * handSize(players.length)) {
    throw new ImportError("The deck is too short for the starting hands.");
  }

  const notes: Record<number, string> = {};
  const rawNotes = data.notes;
  if (Array.isArray(rawNotes) && Array.isArray(rawNotes[ourPlayerIndex])) {
    (rawNotes[ourPlayerIndex] as unknown[]).forEach((note, order) => {
      if (typeof note === "string" && note.trim() !== "") notes[order] = note;
    });
  }

  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    title: title ?? `Imported game (${players.join(", ")})`,
    players: players as string[],
    ourPlayerIndex: Math.min(Math.max(ourPlayerIndex, 0), players.length - 1),
    variantName,
    deck,
    actions,
    // Every identity is in the deck, so the engine can derive clue touches.
    touchedByAction: {},
    notes,
    finishedAt: now,
    hanabLiveId: typeof data.id === "number" && data.id > 0 ? data.id : undefined,
    options: {
      deckPlays: rawOptions.deckPlays === true,
      emptyClues: rawOptions.emptyClues === true,
    },
  };
}
