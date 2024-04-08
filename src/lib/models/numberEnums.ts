export enum Numbers {
  One = 1,
  Two = 1 << 1,
  Three = 1 << 2,
  Four = 1 << 3,
  Five = 1 << 4,
  All = One | Two | Three | Four | Five,
}

export function getNumbers(numbers: number): Numbers[] {
  // a helper function to take a number and return the suits
  let power = 0;
  let output: number[] = [];
  while (1 << power < numbers) {
    if (((1 << power) & numbers) == 1 << power) {
      // 00001(red) & 11111 (no variant) = 00001 (red)
      output.push(1 << power);
    }
  }
  return output; // an array of the numbers, in order
}
