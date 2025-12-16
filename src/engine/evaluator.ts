import type { Puzzle } from "./types";


export function evaluateAttempt<TInput>(
  puzzle: Puzzle<TInput>,
  input: TInput
): boolean {
  return puzzle.evaluate(input);
}
