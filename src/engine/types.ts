export type RuleResult = boolean;

export interface Attempt<TInput = unknown> {
  input: TInput;
  result: RuleResult;
  timestamp: number; // Date.now()
}

export interface ValidationCase<TInput = unknown> {
  input: TInput;
  expected: RuleResult;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Puzzle<TInput = unknown> {
  id: string;
  title: string;
  description?: string;

  difficulty: Difficulty;

  evaluate: (input: TInput) => RuleResult;

  hints: string[];

  validationCases: ValidationCase<TInput>[];
}
