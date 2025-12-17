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
  },
  // en src/content/rules.ts, debajo de greaterThanFive:

  startsWithVowel: {
    parse: (raw: string) => {
        const s = raw.trim().toLowerCase();
        return s.length ? s : null;
    },
    evaluate: (s: string) => "aeiou".includes(s[0]),
    validationCases: ["auto", "barco", "elefante", "nube", "oso", "sol"].map(s => ({
        input: s,
        expected: "aeiou".includes(s.trim().toLowerCase()[0])
    }))
    },

    isPositive: {
    parse: (raw: string) => {
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    },
    evaluate: (n: number) => n > 0,
    validationCases: [-3, -1, 0, 1, 10].map(n => ({
        input: n,
        expected: n > 0
    }))
    },

    divisibleBy3: {
    parse: (raw: string) => {
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    },
    evaluate: (n: number) => n % 3 === 0,
    validationCases: [1, 3, 4, 6, 9, 10, 12].map(n => ({
        input: n,
        expected: n % 3 === 0
    }))
    },

    moreThanTwoVowels: {
    parse: (raw: string) => {
        const s = raw.trim().toLowerCase();
        return s.length ? s : null;
    },
    evaluate: (s: string) => {
        const vowels = s.split("").filter(ch => "aeiou".includes(ch)).length;
        return vowels > 2;
    },
    validationCases: ["sol", "mate", "avion", "murcielago", "cielo", "paralelepipedo"].map(s => {
        const vowels = s.toLowerCase().split("").filter(ch => "aeiou".includes(ch)).length;
        return { input: s, expected: vowels > 2 };
    })
    },

};
