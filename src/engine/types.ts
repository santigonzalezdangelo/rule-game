// src/engine/types.ts
export type RuleResult = boolean;

export interface Attempt<TInput = unknown> {
  input: TInput;
  result: RuleResult;
  timestamp: number;
}

export interface ValidationCase<TInput = unknown> {
  input: TInput;
  expected: RuleResult;
}

export type Difficulty = "easy" | "medium" | "hard";

/** ✅ NUEVO: ids para reglas base (las de src/content/rules.ts) */
export type RuleId = string;

/** ✅ NUEVO: operadores lógicos (dejamos XOR/NOT preparados) */
export type LogicOp = "and" | "or" | "xor" | "not";

/**
 * ✅ NUEVO: Hoja del árbol.
 * Por ahora Isla 3 usa solo { kind:"rule", ruleId } aplicando al rawInput del usuario.
 * arg queda para futuro (por ej: aplicar la regla a una parte del input).
 */
export type RuleTest<TRawInput = string> =
  | { kind: "rule"; ruleId: RuleId }
  | { kind: "rule"; ruleId: RuleId; arg: TRawInput };

/**
 * ✅ NUEVO: Expresión lógica (árbol)
 */
export type LogicExpr<TRawInput = string> =
  | { op: "test"; test: RuleTest<TRawInput> }
  | { op: "not"; expr: LogicExpr<TRawInput> }
  | { op: "and" | "or" | "xor"; exprs: LogicExpr<TRawInput>[] };

/**
 * RawInput: lo que viene de la UI (texto).
 * TInput: lo que usa la regla (number, string, array, etc.)
 */
export interface Puzzle<TInput = unknown, TRawInput = string> {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;

  // Convierte lo que escribe el usuario a un input válido para evaluate()
  parse: (raw: TRawInput) => TInput | null;

  // La regla secreta:
  evaluate: (input: TInput) => RuleResult;

  hints: string[];
  validationCases: ValidationCase<TInput>[];

  // ✅ Se muestra al ganar (la “regla” explicada)
  reveal: {
    title?: string;
    description: string;
    examples?: Array<{ input: TInput; result: RuleResult }>;
  };

  /**
   * ✅ NUEVO (opcional): definición declarativa.
   * Si está, el loader puede construir parse/evaluate automáticamente.
   * Esto te habilita Isla 3 con AND/OR sin cambiar la UI ni el motor.
   */
  logic?: {
    expr: LogicExpr<TRawInput>;
    /** opcional: texto para UI/pistas */
    label?: string;
  };
}
