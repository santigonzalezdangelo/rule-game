import type { Puzzle } from "./types";

export function getHint<TInput, TRawInput>(
  puzzle: Puzzle<TInput, TRawInput>,
  level: number
): string | null {
  return puzzle.hints[level] ?? null;
}
