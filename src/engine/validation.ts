import type { Puzzle } from "./types";


export function validateUnderstanding<TInput>(
  puzzle: Puzzle<TInput>,
  userAnswers: boolean[]
): boolean {
  if (userAnswers.length !== puzzle.validationCases.length) return false;

  return puzzle.validationCases.every((c, i) => c.expected === userAnswers[i]);
}
