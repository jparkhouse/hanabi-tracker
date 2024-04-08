export const enum SuitsUsed {
    None = 0,
    Red = 1,
    Yellow = 1 << 1,
    Blue = 1 << 2,
    White = 1 << 3,
    Green = 1 << 4,
    Rainbow = 1 << 5,
    Black = 1 << 6,
}

export const enum Variant {
    NoVariant = SuitsUsed.Red + SuitsUsed.Yellow + SuitsUsed.Blue + SuitsUsed.White + SuitsUsed.Green,
    Rainbows = NoVariant + SuitsUsed.Rainbow,
    Blacks = NoVariant + SuitsUsed.Black,
    RainbowsAndBlacks = NoVariant + SuitsUsed.Rainbow + SuitsUsed.Black,
}