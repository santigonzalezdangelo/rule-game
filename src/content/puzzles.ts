// src/content/puzzles.ts
import type { Puzzle } from "../engine";

// Puzzle 1: ✅ si el número es par
const evenPuzzle: Puzzle<number> = {
  id: "even-001",
  title: "Par o impar",
  description: "Probá números y descubrí la regla.",
  difficulty: "easy",
  evaluate: (n) => n % 2 === 0,
  hints: [
    "Probá con números chicos.",
    "La regla depende del resto al dividir por 2.",
    "✅ si es par, ❌ si es impar.",
  ],
  validationCases: [
    { input: 1, expected: false },
    { input: 2, expected: true },
    { input: 7, expected: false },
    { input: 10, expected: true },
    { input: 13, expected: false },
    { input: 18, expected: true },
    { input: 21, expected: false },
    { input: 22, expected: true },
    { input: 99, expected: false },
    { input: 100, expected: true },
  ],
};

// Puzzle 2: ✅ si la palabra tiene cantidad par de letras (ignora espacios)
const evenLengthWordPuzzle: Puzzle<string> = {
  id: "word-001",
  title: "Letras pares",
  description: "Probá palabras. ¿Qué las hace ✅?",
  difficulty: "easy",
  evaluate: (s) => s.replaceAll(" ", "").length % 2 === 0,
  hints: [
    "Probá palabras cortas y largas.",
    "No importa el significado; importa algo medible.",
    "✅ si (sin espacios) tiene cantidad par de letras.",
  ],
  validationCases: [
    { input: "a", expected: false },
    { input: "aa", expected: true },
    { input: "casa", expected: true },
    { input: "perro", expected: false }, // 5
    { input: "hola", expected: true },   // 4
    { input: "buen dia", expected: false }, // "buendia" = 7
    { input: "buenas", expected: true }, // 6
    { input: "sol", expected: false },   // 3
    { input: "mate", expected: true },   // 4
    { input: "yerba", expected: false }, // 5
  ],
};

export const puzzles = [evenPuzzle, evenLengthWordPuzzle] as const;
