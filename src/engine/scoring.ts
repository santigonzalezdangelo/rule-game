// src/engine/scoring.ts
export interface ScoreInput {
  attempts: number;
  hintsUsed: number;
  timeSeconds: number;
}

export function calculateScore({ attempts, hintsUsed, timeSeconds }: ScoreInput): number {
  let score = 1000;
  score -= attempts * 50;
  score -= hintsUsed * 120;
  score -= Math.floor(timeSeconds / 10) * 10;
  return Math.max(0, score);
}
