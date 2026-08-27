#!/usr/bin/env node
// Regenerates src/lib/hanabi/variantData.ts from hanab.live's upstream JSON.
//
//   node tools/gen-variants.mjs
//
// Needs network access. Run it when hanab.live adds suits or variants; the
// generated file is committed so the app itself never hits the network.
//
// Every variant hanab.live offers is emitted. The derivations below are ports of
// hanab.live's own `suitsInit.ts` and `variantsInit.ts`, so a suit's clue colours
// and a variant's colour list come out in the same order the server indexes them
// — which is what makes an exported colour clue mean the same thing on replay.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE =
  "https://raw.githubusercontent.com/Hanabi-Live/hanabi-live/main/packages/game/src/json";
const OUT = fileURLToPath(new URL("../src/lib/hanabi/variantData.ts", import.meta.url));

const REVERSED_SUFFIX = " Reversed";

const fetchJson = async (name) => {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: ${res.status} ${res.statusText}`);
  return res.json();
};

const [variants, suits, colors] = await Promise.all(
  ["variants.json", "suits.json", "colors.json"].map(fetchJson),
);

const colorByName = new Map(colors.map((c) => [c.name, c]));

// --- suits ------------------------------------------------------------------
// Ports `getSuitClueColors`: explicit list, nothing for the special families,
// otherwise the colour that shares the suit's name.
const clueColorsOf = (s) => {
  if (s.clueColors !== undefined) {
    for (const name of s.clueColors) {
      if (!colorByName.has(name)) throw new Error(`${s.name}: no colour ${name}`);
    }
    return s.clueColors;
  }
  if (s.name === "Unknown") return [];
  if (s.allClueColors || s.noClueColors || s.prism) return [];
  if (colorByName.has(s.name)) return [s.name];
  throw new Error(`cannot derive clue colours for suit ${s.name}`);
};

// Ports `getSuitFillAndFillColorblind`: own fill, else the same-named colour's,
// else the first clue colour's.
const fillOf = (s, clueColors) => {
  if (s.fill === "multi") return s.fillColors;
  if (s.fill) return [s.fill];
  const color = colorByName.get(s.name) ?? colorByName.get(clueColors[0]);
  if (!color) throw new Error(`no fill for ${s.name}`);
  return [color.fill];
};

const suitDefs = new Map();
for (const s of suits) {
  if (s.name === "Unknown") continue;
  const clueColors = clueColorsOf(s);
  const def = {
    name: s.name,
    display: s.displayName ?? s.name,
    abbr: s.abbreviation ?? colorByName.get(s.name)?.abbreviation ?? s.name[0].toUpperCase(),
    fill: fillOf(s, clueColors),
    clueColors,
    oneOfEach: !!s.oneOfEach,
    allClueColors: !!s.allClueColors,
    noClueColors: !!s.noClueColors,
    allClueRanks: !!s.allClueRanks,
    noClueRanks: !!s.noClueRanks,
    prism: !!s.prism,
    reversed: false,
  };
  suitDefs.set(def.name, def);
  // hanab.live registers a reversed twin of every suit; variants name them with
  // the suffix. The stack runs 5->1, nothing else changes.
  suitDefs.set(def.name + REVERSED_SUFFIX, {
    ...def,
    name: def.name + REVERSED_SUFFIX,
    display: def.display + REVERSED_SUFFIX,
    reversed: true,
  });
}

// --- variant rules ----------------------------------------------------------
const RULE_FIELDS = [
  ["clueRanks", null],
  ["stackSize", 5],
  ["specialRank", 0],
  ["specialRankAllClueColors", false],
  ["specialRankAllClueRanks", false],
  ["specialRankNoClueColors", false],
  ["specialRankNoClueRanks", false],
  ["specialRankDeceptive", false],
  ["criticalRank", 0],
  ["scarceOnes", false],
  ["clueStarved", false],
  ["colorCluesTouchNothing", false],
  ["rankCluesTouchNothing", false],
  ["alternatingClues", false],
  ["cowAndPig", false],
  ["duck", false],
  ["oddsAndEvens", false],
  ["synesthesia", false],
  ["upOrDown", false],
  ["throwItInAHole", false],
  ["funnels", false],
  ["chimneys", false],
  ["sudoku", false],
];

const rulesOf = (v) => {
  const out = {};
  for (const [field, fallback] of RULE_FIELDS) out[field] = v[field] ?? fallback;
  // `clueRanks` defaults to every rank on the stack, so a 4-high Sudoku stack
  // offers 1-4. Kept explicit here so the runtime never has to re-derive it.
  out.clueRanks ??= [1, 2, 3, 4, 5].slice(0, out.stackSize);
  return out;
};

// Ports `getVariantClueColors`, minus the common case: only Color Mute names its
// own (empty) colour list. Everywhere else the list falls out of the suits, so
// the runtime derives it and the rule sets stay shareable across suit counts.
const clueColorsOverride = (v) => v.clueColors ?? null;

// --- assemble ---------------------------------------------------------------
const suitOrder = [];
const ruleSets = [];
const rows = [];

for (const v of variants) {
  const suitList = v.suits.map((n) => {
    const def = suitDefs.get(n);
    if (!def) throw new Error(`${v.name}: unknown suit ${n}`);
    return def;
  });
  for (const s of suitList) if (!suitOrder.includes(s.name)) suitOrder.push(s.name);

  const rules = { ...rulesOf(v), clueColors: clueColorsOverride(v) };
  const key = JSON.stringify(rules);
  let rulesIndex = ruleSets.findIndex((r) => r.key === key);
  if (rulesIndex === -1) rulesIndex = ruleSets.push({ key, rules }) - 1;

  rows.push({ name: v.name, suits: v.suits, rulesIndex });
}

const suitIndex = new Map(suitOrder.map((n, i) => [n, i]));

// Only the colours some suit can actually be clued by need a swatch.
const usedColors = new Set([...suitDefs.values()].flatMap((s) => s.clueColors));
const colorRows = colors
  .filter((c) => usedColors.has(c.name))
  .map((c) => `  { name: ${JSON.stringify(c.name)}, fill: ${JSON.stringify(c.fill)} },`);

const j = JSON.stringify;
const bool = (b) => (b ? "true" : "false");

const out = `// AUTO-GENERATED by tools/gen-variants.mjs from hanab.live's upstream
// variants.json / suits.json / colors.json. Do not edit by hand.
//
// Every variant hanab.live offers, with the rules that make it different. Suit
// and colour derivations are ports of hanab.live's own, and variant names are
// verbatim, so exports import cleanly there.

export interface SuitDef {
  /** hanab.live suit name, e.g. \`Dark Rainbow\`. */
  readonly name: string;
  readonly display: string;
  /** Single letter drawn on the card face. */
  readonly abbr: string;
  /** One colour, or several for a multicolour gradient. */
  readonly fill: readonly string[];
  /** Colour clues that name this suit: none for Rainbow-likes, two for dual-colour. */
  readonly clueColors: readonly string[];
  readonly oneOfEach: boolean;
  readonly allClueColors: boolean;
  readonly noClueColors: boolean;
  readonly allClueRanks: boolean;
  readonly noClueRanks: boolean;
  readonly prism: boolean;
  /** This suit's stack runs 5 down to 1. */
  readonly reversed: boolean;
}

export interface ColorDef {
  readonly name: string;
  readonly fill: string;
}

/** Everything about a variant beyond its suit list. */
export interface RuleSet {
  /**
   * Overrides the colour list derived from the suits. Only Color Mute sets it,
   * to nothing; \`null\` everywhere else.
   */
  readonly clueColors: readonly string[] | null;
  readonly clueRanks: readonly number[];
  /** How many cards complete one stack; 4 in four-suit Sudoku. */
  readonly stackSize: number;
  /** Rank with special clue behaviour, or 0 for none. */
  readonly specialRank: number;
  readonly specialRankAllClueColors: boolean;
  readonly specialRankAllClueRanks: boolean;
  readonly specialRankNoClueColors: boolean;
  readonly specialRankNoClueRanks: boolean;
  readonly specialRankDeceptive: boolean;
  /** Rank with only one copy per suit, or 0 for none. */
  readonly criticalRank: number;
  readonly scarceOnes: boolean;
  readonly clueStarved: boolean;
  readonly colorCluesTouchNothing: boolean;
  readonly rankCluesTouchNothing: boolean;
  readonly alternatingClues: boolean;
  readonly cowAndPig: boolean;
  readonly duck: boolean;
  readonly oddsAndEvens: boolean;
  readonly synesthesia: boolean;
  readonly upOrDown: boolean;
  readonly throwItInAHole: boolean;
  readonly funnels: boolean;
  readonly chimneys: boolean;
  readonly sudoku: boolean;
}

export const SUITS: readonly SuitDef[] = [
${suitOrder
  .map((n) => {
    const s = suitDefs.get(n);
    return `  { name: ${j(s.name)}, display: ${j(s.display)}, abbr: ${j(s.abbr)}, fill: ${j(s.fill)}, clueColors: ${j(s.clueColors)}, oneOfEach: ${bool(s.oneOfEach)}, allClueColors: ${bool(s.allClueColors)}, noClueColors: ${bool(s.noClueColors)}, allClueRanks: ${bool(s.allClueRanks)}, noClueRanks: ${bool(s.noClueRanks)}, prism: ${bool(s.prism)}, reversed: ${bool(s.reversed)} },`;
  })
  .join("\n")}
];

export const COLORS: readonly ColorDef[] = [
${colorRows.join("\n")}
];

/** Deduplicated: 2000-odd variants share a few dozen rule sets. */
export const RULE_SETS: readonly RuleSet[] = [
${ruleSets
  .map(({ rules: r }) => {
    const fields = [
      `clueColors: ${r.clueColors === null ? "null" : j(r.clueColors)}`,
      `clueRanks: ${j(r.clueRanks)}`,
      `stackSize: ${r.stackSize}`,
      `specialRank: ${r.specialRank}`,
      ...RULE_FIELDS.filter(([f]) => f.startsWith("specialRank") && f !== "specialRank").map(
        ([f]) => `${f}: ${bool(r[f])}`,
      ),
      `criticalRank: ${r.criticalRank}`,
      ...[
        "scarceOnes",
        "clueStarved",
        "colorCluesTouchNothing",
        "rankCluesTouchNothing",
        "alternatingClues",
        "cowAndPig",
        "duck",
        "oddsAndEvens",
        "synesthesia",
        "upOrDown",
        "throwItInAHole",
        "funnels",
        "chimneys",
        "sudoku",
      ].map((f) => `${f}: ${bool(r[f])}`),
    ];
    return `  { ${fields.join(", ")} },`;
  })
  .join("\n")}
];

/** \`[hanab.live variant name, suit indices into SUITS, index into RULE_SETS]\`. */
export type VariantDef = readonly [name: string, suits: readonly number[], rules: number];

export const VARIANTS: readonly VariantDef[] = [
${rows
  .map((r) => `  [${j(r.name)}, [${r.suits.map((n) => suitIndex.get(n)).join(",")}], ${r.rulesIndex}],`)
  .join("\n")}
];
`;

writeFileSync(OUT, out);
console.log(
  `wrote ${rows.length} variants, ${suitOrder.length} suits, ${ruleSets.length} rule sets to ${OUT}`,
);
