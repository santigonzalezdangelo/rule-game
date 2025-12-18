// src/App.tsx
import { useEffect, useMemo, useState } from "react";

import inicio from "./content/puzzles/inicio.json";
import primerosPasos from "./content/puzzles/primeros-pasos.json";
import fundamentos from "./content/puzzles/fundamentos.json";

import { loadPuzzle } from "./content/loader";
import { createSession } from "./engine";

const islandSets = {
  "island-01": { title: "Inicio", data: inicio },
  "island-02": { title: "Primeros Pasos", data: primerosPasos },
  "island-03": { title: "Fundamentos", data: fundamentos },
} as const;

type IslandId = keyof typeof islandSets;

const ISLAND_ORDER: IslandId[] = ["island-01", "island-02", "island-03"];

const STORAGE_KEY = "rulegame.progress.v1";

type ProgressStore = {
  selectedIslandId: IslandId;
  islandIndex: Partial<Record<IslandId, number>>;
  solved: Record<
    string,
    {
      wonAt: number;
      bestScore: number | null;
    }
  >;
};

function loadProgress(): ProgressStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return null;
  }
}

function saveProgress(p: ProgressStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function clampIndex(i: number, len: number) {
  return Math.min(i, Math.max(0, len - 1));
}

export default function App() {
  // ✅ Progreso persistido
  const [progress, setProgress] = useState<ProgressStore>(() => {
    const loaded = loadProgress();
    return (
      loaded ?? {
        selectedIslandId: "island-01",
        islandIndex: {},
        solved: {},
      }
    );
  });

  // ✅ Guardado centralizado (esto arregla tu problema de persistencia)
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Isla seleccionada (inicial desde progress)
  const [islandId, setIslandId] = useState<IslandId>(progress.selectedIslandId);

  // Puzzles cargados de la isla
  const puzzles = useMemo(() => {
    const set = islandSets[islandId].data;
    return set.puzzles.map(loadPuzzle);
  }, [islandId]);

  // Índice (inicial desde progress para esa isla)
  const [index, setIndex] = useState<number>(() => progress.islandIndex[progress.selectedIslandId] ?? 0);

  // ✅ índice seguro SIEMPRE
  const safeIndex = clampIndex(index, puzzles.length);
  const puzzle = puzzles[safeIndex];

  // Sesión del puzzle actual
  const session = useMemo(() => createSession(puzzle), [puzzle]);

  // Forzar re-render cuando cambia el estado interno de session
  const [, forceRender] = useState(0);
  const rerender = () => forceRender((n) => n + 1);

  // Derivados
  const state = session.getState();
  const hints = session.getVisibleHints();
  const reveal = session.getReveal();

  // UI states
  const [rawInput, setRawInput] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>(() => puzzle.validationCases.map(() => false));

  // ✅ Cuando cambia isla, restaurar index guardado para esa isla
  useEffect(() => {
    const stored = progress.islandIndex[islandId] ?? 0;
    setIndex(clampIndex(stored, puzzles.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandId, puzzles.length]);

  // ✅ Guardar selected island + index por isla (en el state `progress`)
  useEffect(() => {
    setProgress((prev) => ({
      ...prev,
      selectedIslandId: islandId,
      islandIndex: { ...prev.islandIndex, [islandId]: safeIndex },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandId, safeIndex]);

  // ✅ Reset UI al cambiar puzzle
  useEffect(() => {
    setRawInput("");
    setShowValidation(false);
    setAnswers(puzzle.validationCases.map(() => false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [islandId, puzzle.id]);

  // ✅ Guardar solved + best score al ganar
  useEffect(() => {
    if (state.status !== "won") return;

    setProgress((prev) => {
      const prevSolved = prev.solved[puzzle.id];
      const prevBest = prevSolved?.bestScore ?? null;
      const newScore = state.score ?? null;

      const bestScore =
        prevBest === null
          ? newScore
          : newScore === null
          ? prevBest
          : Math.max(prevBest, newScore);

      return {
        ...prev,
        solved: {
          ...prev.solved,
          [puzzle.id]: { wonAt: Date.now(), bestScore },
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.score, puzzle.id]);

  // ✅ Progresión: isla desbloqueada si la anterior está completa
  const solvedIds = useMemo(() => new Set(Object.keys(progress.solved)), [progress.solved]);

  function isIslandComplete(id: IslandId) {
    const rawPuzzles = islandSets[id].data.puzzles;
    return rawPuzzles.every((p: any) => solvedIds.has(p.id));
  }

  function isIslandUnlocked(id: IslandId) {
    const pos = ISLAND_ORDER.indexOf(id);
    if (pos <= 0) return true; // isla 1 siempre
    const prevIsland = ISLAND_ORDER[pos - 1];
    return isIslandComplete(prevIsland);
  }

  // Handlers
  function onTry() {
    const res = session.tryRawInput(rawInput.trim());
    if (!res.ok) {
      alert("Input inválido");
      return;
    }
    // ✅ borrar input después de intentar
    setRawInput("");
    rerender();
  }

  function onHint() {
    session.revealHint();
    rerender();
  }

  function onSubmitValidation() {
    const ok = session.submitValidation(answers);
    rerender();
    if (!ok) alert("No coincide 😅 Probá de nuevo.");
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setIndex((i) => Math.min(puzzles.length - 1, i + 1));
  }

  const solvedInfo = progress.solved[puzzle.id];

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Rule Game (UI de test)</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Isla:
          <select
            value={islandId}
            onChange={(e) => {
              const nextIsland = e.target.value as IslandId;
              if (!isIslandUnlocked(nextIsland)) {
                alert("Primero completá todos los puzzles de la isla anterior 🙂");
                return;
              }
              setIslandId(nextIsland);
            }}
            style={{ marginLeft: 8, padding: 6 }}
          >
            {ISLAND_ORDER.map((id) => {
              const info = islandSets[id];
              const unlocked = isIslandUnlocked(id);
              const done = isIslandComplete(id);
              return (
                <option key={id} value={id} disabled={!unlocked}>
                  {info.title} {done ? "✅" : ""}
                </option>
              );
            })}
          </select>
        </label>

        <button onClick={prev} disabled={safeIndex === 0} style={{ padding: "8px 12px" }}>
          ◀ Anterior
        </button>
        <button onClick={next} disabled={safeIndex === puzzles.length - 1} style={{ padding: "8px 12px" }}>
          Siguiente ▶
        </button>

        <span style={{ opacity: 0.75 }}>
          Puzzle {safeIndex + 1} / {puzzles.length}
        </span>

        <button
          onClick={() => {
            session.reset();
            setAnswers(puzzle.validationCases.map(() => false));
            rerender();
          }}
          style={{ padding: "8px 12px" }}
        >
          Reset puzzle
        </button>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2 style={{ margin: 0 }}>
        {puzzle.title} {solvedInfo ? "✅" : ""}
      </h2>

      <p style={{ marginTop: 6, opacity: 0.8 }}>Dificultad: {puzzle.difficulty}</p>

      {state.status === "won" && (
        <div style={{ marginTop: 10, padding: 12, border: "1px solid #2a2", borderRadius: 8 }}>
          <b>✅ ¡Ganaste!</b>

          {reveal && (
            <div style={{ marginTop: 8 }}>
              <b>{reveal.title ?? "La regla era:"}</b>
              <p style={{ margin: "6px 0 0" }}>{reveal.description}</p>
            </div>
          )}

          {state.score !== null && (
            <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
              Score: <b>{state.score}</b>
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Probá un input..."
          style={{ padding: 10, minWidth: 260 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onTry();
          }}
        />
        <button onClick={onTry} style={{ padding: "10px 14px" }}>
          Probar
        </button>
        <button onClick={onHint} style={{ padding: "10px 14px" }}>
          Pista
        </button>
        <button onClick={() => setShowValidation((v) => !v)} style={{ padding: "10px 14px" }}>
          Resolver
        </button>
      </div>

      {hints.length > 0 && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Pistas</b>
          <ul style={{ margin: "8px 0 0" }}>
            {hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {showValidation && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Validación</b>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Marcá cuáles casos darían ✅ (true). Los no marcados se consideran ❌.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {puzzle.validationCases.map((c, i) => (
              <label key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={answers[i] ?? false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAnswers((prev) => {
                      const copy = [...prev];
                      copy[i] = checked;
                      return copy;
                    });
                  }}
                />
                <span>
                  Caso {i + 1}: <code>{String(c.input)}</code>
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={onSubmitValidation} style={{ padding: "10px 14px" }}>
              Enviar validación
            </button>
            <button onClick={() => setAnswers(puzzle.validationCases.map(() => false))} style={{ padding: "10px 14px" }}>
              Limpiar
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <b>Intentos</b>
        {state.attempts.length === 0 ? (
          <p style={{ opacity: 0.75 }}>Todavía no probaste nada.</p>
        ) : (
          <ul>
            {state.attempts.map((a, idx) => (
              <li key={a.timestamp + "-" + idx}>
                <code>{String(a.input)}</code> → {a.result ? "✅" : "❌"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
