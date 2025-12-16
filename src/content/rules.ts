// src/content/rules.ts
import type { ValidationCase } from "../engine";

export const rules = {
  isEven: {
    parse: (raw: string) => {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    },
    evaluate: (n: number) => n % 2 === 0,
    validationCases: [1, 2, 3, 4, 5, 6].map(n => ({
      input: n,
      expected: n % 2 === 0
    }))
  },

  evenWordLength: {
    parse: (raw: string) => {
      const s = raw.trim();
      return s.length ? s : null;
    },
    evaluate: (s: string) => s.length % 2 === 0,
    validationCases: ["a", "aa", "hola", "perro"].map(s => ({
      input: s,
      expected: s.length % 2 === 0
    }))
  },

  greaterThanFive: {
    parse: (raw: string) => {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    },
    evaluate: (n: number) => n > 5,
    validationCases: [3, 5, 6, 10].map(n => ({
      input: n,
      expected: n > 5
    }))
  }
};
