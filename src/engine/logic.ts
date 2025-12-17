// src/engine/logic.ts
import type { RuleId, RuleTest, LogicExpr } from "./types";
import { rules } from "../content/rules";

/**
 * Evalúa un test hoja: aplica una regla (ruleId) al input crudo.
 * Si la regla no existe o parse falla -> false.
 */
export function evalRuleTest(rawInput: string, test: RuleTest): boolean {
  const r = rules[test.ruleId as RuleId];
  if (!r) return false;

  // Por ahora usamos el rawInput tal cual.
  // (arg queda preparado para futuro)
  const inputToUse = "arg" in test ? String(test.arg) : rawInput;

  const parsed = r.parse(inputToUse);
  if (parsed == null) return false;

  return r.evaluate(parsed as never);
}

/**
 * Evalúa una expresión lógica (árbol).
 */
export function evalLogicExpr(rawInput: string, expr: LogicExpr): boolean {
  switch (expr.op) {
    case "test":
      return evalRuleTest(rawInput, expr.test);

    case "not":
      return !evalLogicExpr(rawInput, expr.expr);

    case "and":
      // AND de lista vacía => true (identidad). Si no querés esto, lo cambiamos.
      return expr.exprs.every((e) => evalLogicExpr(rawInput, e));

    case "or":
      // OR de lista vacía => false
      return expr.exprs.some((e) => evalLogicExpr(rawInput, e));

    case "xor": {
      // XOR: true si la cantidad de true es impar
      let count = 0;
      for (const e of expr.exprs) if (evalLogicExpr(rawInput, e)) count++;
      return (count % 2) === 1;
    }
  }
}

/**
 * Pretty-print opcional para mostrar en UI (pistas, debug).
 */
export function formatLogicExpr(expr: LogicExpr): string {
  switch (expr.op) {
    case "test":
      return expr.test.kind === "rule"
        ? String(expr.test.ruleId)
        : `${String(expr.test.ruleId)}(${String((expr.test as any).arg ?? "")})`;

    case "not":
      return `NOT(${formatLogicExpr(expr.expr)})`;

    case "and":
    case "or":
    case "xor":
      return `(${expr.exprs.map(formatLogicExpr).join(` ${expr.op.toUpperCase()} `)})`;
  }
}
