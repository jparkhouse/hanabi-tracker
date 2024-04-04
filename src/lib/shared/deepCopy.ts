import type { Card } from "../models/card";

export function deepCopy(obj: string | Card | Card[]) {
  const json = JSON.stringify(obj);
  const output = JSON.parse(json);
  return output;
}