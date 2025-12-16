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
    title?: string;       // ej: "La regla era..."
    description: string;  // explicación clara
    examples?: Array<{ input: TInput; result: RuleResult }>;
  };
}
