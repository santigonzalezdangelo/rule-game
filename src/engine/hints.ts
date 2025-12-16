import type { Puzzle } from "./types";


export function getHint<TInput>(puzzle: Puzzle<TInput>, level: number): string | null {
  return puzzle.hints[level] ?? null;
}
