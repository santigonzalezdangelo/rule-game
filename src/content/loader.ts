// src/content/loader.ts
import type { Difficulty, Puzzle, RuleId, ValidationCase } from "../engine";
import { evalLogicExpr } from "../engine";
import { rules } from "./rules";
import { compileCombined } from "./logicBuilders";

type RevealJson = { description: string };

export type PuzzleJsonSingle = {
  id: string;
  title: string;
  difficulty: Difficulty;
  rule: string;
  hints: string[];
  reveal: RevealJson;
};

export type PuzzleJsonLogic = {
  id: string;
  title: string;
  difficulty: Difficulty;
  logic: {
    condition: "and" | "or";
    rules: string[];
    label?: string;
  };
  hints: string[];
  reveal: RevealJson;
  validationCases: ValidationCase<string>[];
};

export type PuzzleJson = PuzzleJsonSingle | PuzzleJsonLogic;

function assertRuleExists(ruleId: string): asserts ruleId is RuleId {
  if (!(ruleId in rules)) throw new Error(`Rule not found: ${ruleId}`);
}

export function loadPuzzle(p: PuzzleJson): Puzzle<any, string> {
  // ✅ Isla 3: logic
  if ("logic" in p) {
    for (const rid of p.logic.rules) assertRuleExists(rid);

    const expr = compileCombined({
      condition: p.logic.condition,
      rules: p.logic.rules as RuleId[],
    });

    return {
      id: p.id,
      title: p.title,
      description: undefined,
      difficulty: p.difficulty,

      // para que funcione tanto si evalúan con parse/evaluate como con isValidInput
      parse: (raw) => raw,
      evaluate: (raw) => evalLogicExpr(String(raw), expr),

      hints: p.hints,
      validationCases: p.validationCases,

      reveal: { description: p.reveal.description },

      logic: {
        expr,
        label: p.logic.label ?? `${p.logic.condition.toUpperCase()}(${p.logic.rules.join(", ")})`,
      },
    };
  }

  // ✅ Islas 1-2: rule simple
  assertRuleExists(p.rule);
  const rule = rules[p.rule];

  return {
    id: p.id,
    title: p.title,
    description: undefined,
    difficulty: p.difficulty,

    parse: rule.parse,
    evaluate: rule.evaluate,

    hints: p.hints,
    validationCases: rule.validationCases,

    reveal: { description: p.reveal.description },
  };
}
