// src/engine/session.ts
import type { Attempt, Puzzle } from "./types";
import { evaluateAttempt } from "./evaluator";
import { getHint } from "./hints";
import { validateUnderstanding } from "./validation";
import { calculateScore } from "./scoring";

export type GameStatus = "playing" | "won";

export interface GameSessionState<TInput> {
  puzzleId: string;
  status: GameStatus;
  attempts: Attempt<TInput>[];
  hintLevel: number;
  startedAt: number;
  wonAt: number | null;
  score: number | null;
}

export function createSession<TInput, TRawInput = string>(
  puzzle: Puzzle<TInput, TRawInput>
) {
  let state: GameSessionState<TInput> = {
    puzzleId: puzzle.id,
    status: "playing",
    attempts: [],
    hintLevel: 0,
    startedAt: Date.now(),
    wonAt: null,
    score: null,
  };

  function getState() {
    return state;
  }

  function tryRawInput(raw: TRawInput) {
    const parsed = puzzle.parse(raw);
    if (parsed === null) {
      return { ok: false as const, error: "INPUT_INVALID" as const };
    }

    const result = evaluateAttempt(puzzle, parsed);
    const attempt: Attempt<TInput> = {
      input: parsed,
      result,
      timestamp: Date.now(),
    };

    state = { ...state, attempts: [attempt, ...state.attempts] };
    return { ok: true as const, attempt };
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
    if (!ok) return false;

    const now = Date.now();
    const timeSeconds = Math.floor((now - state.startedAt) / 1000);

    const score = calculateScore({
      attempts: state.attempts.length,
      hintsUsed: state.hintLevel,
      timeSeconds,
    });

    state = { ...state, status: "won", wonAt: now, score };
    return true;
  }

  function getReveal() {
    if (state.status !== "won") return null;
    return puzzle.reveal;
  }

  function reset() {
    state = {
      puzzleId: puzzle.id,
      status: "playing",
      attempts: [],
      hintLevel: 0,
      startedAt: Date.now(),
      wonAt: null,
      score: null,
    };
  }

  return {
    puzzle,
    getState,
    tryRawInput,
    revealHint,
    getVisibleHints,
    submitValidation,
    getReveal,
    reset,
  };
}
