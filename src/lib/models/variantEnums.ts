export enum SuitEnum {
  Red = 1,
  Yellow = 1 << 1,
  Blue = 1 << 2,
  White = 1 << 3,
  Green = 1 << 4,
  Rainbow = 1 << 5,
  Black = 1 << 6,
}

export const enum Variant {
  NoVariant = SuitEnum.Red | SuitEnum.Yellow | SuitEnum.Blue | SuitEnum.White | SuitEnum.Green,
  Rainbows = NoVariant | SuitEnum.Rainbow,
  Blacks = NoVariant | SuitEnum.Black,
  RainbowsAndBlacks = NoVariant | SuitEnum.Rainbow | SuitEnum.Black,
}

interface SuitProperties {
  string: string, // string for repr
  stringHint: string | null; // if this suit has an associated hint, string for the UI display, else null
  colourHint: number | null; // if this colour has an associated hint, the binary hint to be applied
  positiveColourHintModifier: number | null; // if this suit has any modifier for colour hints given - assume | with the colourHint
  negativeColourHintModifier: number | null; // if this suit has any modifier for negative colour hints given
  // assume !(colourHint | negativeColourHintModifier)
  positiveNumberHintModifier: number | null; // if this suit has any modifier for number hints given (for future development) - assume | with the numberHint
  negativeNumberHintModifier: number | null; // if this suit has any modifier for number hints given (for future development)
  // assume !(numberHint | negativeNumberHintModifier)
}

export const suitProperties: Record<SuitEnum, SuitProperties> = {
  [SuitEnum.Red]: {
    string: 'Red',
    stringHint: "Red",
    colourHint: SuitEnum.Red,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.Yellow]: {
    string: 'Yellow',
    stringHint: "Yellow",
    colourHint: SuitEnum.Yellow,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.Blue]: {
    string: 'Blue',
    stringHint: "Blue",
    colourHint: SuitEnum.Blue,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.White]: {
    string: 'White',
    stringHint: "White",
    colourHint: SuitEnum.White,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.Green]: {
    string: 'Green',
    stringHint: "Green",
    colourHint: SuitEnum.Green,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.Rainbow]: {
    string: 'Rainbow',
    stringHint: null,
    colourHint: null,
    positiveColourHintModifier: SuitEnum.Rainbow, // apply rainbow on for any positive hints
    negativeColourHintModifier: SuitEnum.Rainbow, // a negative hint for colour implies not rainbow
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
  [SuitEnum.Black]: {
    string: 'Black',
    stringHint: null,
    colourHint: null,
    positiveColourHintModifier: null,
    negativeColourHintModifier: null,
    positiveNumberHintModifier: null,
    negativeNumberHintModifier: null,
  },
};

export function getSuits(suits: number): SuitEnum[] { // a helper function to take a number and return the suits
    let power = 0;
    let output: number[] = [];
    while ((1 << power) <= suits) {
        if (((1 << power) & suits) == (1 << power)) { // 00001(red) & 11111 (no variant) = 00001 (red) 
            output.push(1 << power);
        }
        power = power + 1;
    }
    return output // an array of the suits, in order
}

// export function getEnumFromString(input: string): Suits | null {
//     const keys = Object.values(Suits);
//     keys.filter(value => {suitProperties[value].stringHint === input})
// }