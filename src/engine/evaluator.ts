import type { Puzzle } from "./types";

export function evaluateAttempt<TInput, TRawInput>(
  puzzle: Puzzle<TInput, TRawInput>,
  input: TInput
): boolean {
  return puzzle.evaluate(input);
}
