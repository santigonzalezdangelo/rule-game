// src/content/loader.ts
import type { Difficulty, Puzzle } from "../engine";
import { rules } from "./rules";

export type PuzzleJson = {
  id: string;
  title: string;
  difficulty: Difficulty;
  rule: string; // 👈 viene del JSON como string común
  hints: string[];
  reveal: { description: string };
};

export function loadPuzzle(p: PuzzleJson): Puzzle<any, string> {
  // ✅ validación en runtime
  if (!(p.rule in rules)) {
    throw new Error(`Rule not found: ${p.rule}`);
  }

  const rule = rules[p.rule as keyof typeof rules];

  return {
    id: p.id,
    title: p.title,
    description: undefined,
    difficulty: p.difficulty,

    parse: rule.parse,
    evaluate: rule.evaluate,
    hints: p.hints,
    validationCases: rule.validationCases,

    reveal: {
      description: p.reveal.description,
    },
  };
}
