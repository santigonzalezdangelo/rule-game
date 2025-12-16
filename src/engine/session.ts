// src/engine/session.ts
import type { Attempt, Puzzle } from "./types";
import { evaluateAttempt } from "./evaluator";
import { getHint } from "./hints";
import { validateUnderstanding } from "./validation";

export type GameStatus = "playing" | "won";

export interface GameSessionState<TInput> {
  puzzleId: string;
  status: GameStatus;
  attempts: Attempt<TInput>[];
  hintLevel: number;
}

export function createSession<TInput>(puzzle: Puzzle<TInput>) {
  let state: GameSessionState<TInput> = {
    puzzleId: puzzle.id,
    status: "playing",
    attempts: [],
    hintLevel: 0,
  };

  function tryInput(input: TInput): Attempt<TInput> {
    const result = evaluateAttempt(puzzle, input);
    const attempt: Attempt<TInput> = { input, result, timestamp: Date.now() };
    state = { ...state, attempts: [attempt, ...state.attempts] };
    return attempt;
  }

  function revealHint(): string | null {
    const hint = getHint(puzzle, state.hintLevel);
    if (hint === null) return null;
    state = { ...state, hintLevel: state.hintLevel + 1 };
    return hint;
  }

  function getVisibleHints(): string[] {
    const hints: string[] = [];
    for (let i = 0; i < state.hintLevel; i++) {
      const h = getHint(puzzle, i);
      if (h) hints.push(h);
    }
    return hints;
  }

  function submitValidation(userAnswers: boolean[]): boolean {
    const ok = validateUnderstanding(puzzle, userAnswers);
    if (ok) state = { ...state, status: "won" };
    return ok;
  }

  function getState() {
    return state;
  }

  function reset() {
    state = { puzzleId: puzzle.id, status: "playing", attempts: [], hintLevel: 0 };
  }

  return {
    puzzle, // metadata (título, validationCases, etc.)
    tryInput,
    revealHint,
    getVisibleHints,
    submitValidation,
    getState,
    reset,
  };
}
