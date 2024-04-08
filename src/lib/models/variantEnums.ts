export enum Suits {
  Red = 1,
  Yellow = 1 << 1,
  Blue = 1 << 2,
  White = 1 << 3,
  Green = 1 << 4,
  Rainbow = 1 << 5,
  Black = 1 << 6,
}

export const enum Variant {
  NoVariant = Suits.Red | Suits.Yellow | Suits.Blue | Suits.White | Suits.Green,
  Rainbows = NoVariant | Suits.Rainbow,
  Blacks = NoVariant | Suits.Black,
  RainbowsAndBlacks = NoVariant | Suits.Rainbow | Suits.Black,
}

interface SuitProperties {
  stringHint: string | null; // if this suit has an associated hint, string for the UI display, else null
  colourHint: number | null; // if this colour has an associated hint, the binary hint to be applied
  positiveColourHintModifier: number | null; // if this suit has any modifier for colour hints given - assume | with the colourHint
  negativeColourHintModifier: number | null; // if this suit has any modifier for negative colour hints given
  // assume !(colourHint | negativeColourHintModifier)
  positiveNumberHintModifier: number | null; // if this suit has any modifier for number hints given (for future development) - assume | with the numberHint
  negativeNumberHintModifier: number | null; // if this suit has any modifier for number hints given (for future development)
  // assume !(numberHint | negativeNumberHintModifier)
}

export const suitProperties: Record<Suits, SuitProperties> = {
  [Suits.Red]: {
    stringHint: "Red",
    colourHint: Suits.Red,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.Yellow]: {
    stringHint: "Yellow",
    colourHint: Suits.Yellow,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.Blue]: {
    stringHint: "Blue",
    colourHint: Suits.Blue,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.White]: {
    stringHint: "White",
    colourHint: Suits.White,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.Green]: {
    stringHint: "Green",
    colourHint: Suits.Green,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.Rainbow]: {
    stringHint: null,
    colourHint: null,
    positiveColourHintModifier: Suits.Rainbow, // apply rainbow on for any positive hints
    negativeColourHintModifier: Suits.Rainbow, // a negative hint for colour implies not rainbow
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [Suits.Black]: {
    stringHint: null,
    colourHint: null,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
};

export function getSuits(suits: number): Suits[] { // a helper function to take a number and return the suits
    let power = 0;
    let output: number[] = [];
    while (1 << power < suits) {
        if (((1 << power) & suits) == (1 << power)) { // 00001(red) & 11111 (no variant) = 00001 (red) 
            output.push(1 << power);
        }
    }
    return output // an array of the suits, in order
}

// export function getEnumFromString(input: string): Suits | null {
//     const keys = Object.values(Suits);
//     keys.filter(value => {suitProperties[value].stringHint === input})
// }