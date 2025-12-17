// src/content/logicBuilders.ts
import type { LogicExpr, RuleId } from "../engine";

export type CombinedRuleDef = {
  rules: RuleId[];
  condition: "and" | "or";
};

export function compileCombined(def: CombinedRuleDef): LogicExpr {
  return {
    op: def.condition,
    exprs: def.rules.map((ruleId) => ({
      op: "test",
      test: { kind: "rule", ruleId },
    })),
  };
}
