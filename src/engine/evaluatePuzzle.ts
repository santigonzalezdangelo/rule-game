// src/engine/evaluatePuzzle.ts
import type { Puzzle, RuleResult } from "./types";
import { evalLogicExpr } from "./logic";

/**
 * Evalúa un rawInput (string) contra el puzzle.
 * - Si el puzzle trae lógica declarativa (puzzle.logic), evalúa la expresión contra el raw.
 * - Si no, usa el flujo clásico: parse(raw) -> evaluate(input)
 */
export function isValidInput<TInput = unknown, TRawInput = string>(
  puzzle: Puzzle<TInput, TRawInput>,
  rawInput: TRawInput
): RuleResult {
  // ✅ Nuevo modo: expresión lógica declarativa
  if (puzzle.logic) {
    return evalLogicExpr(String(rawInput), puzzle.logic.expr);
  }

  // ✅ Modo clásico: parse + evaluate
  const parsed = puzzle.parse(rawInput);
  if (parsed == null) return false;

  return puzzle.evaluate(parsed);
}
