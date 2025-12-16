import { useMemo, useState } from "react";
import { puzzles } from "./content/puzzles";
import { createSession } from "./engine";

type PuzzleId = (typeof puzzles)[number]["id"];

export default function App() {
  const [selectedId, setSelectedId] = useState<PuzzleId>(puzzles[0].id);

  const puzzle = useMemo(() => puzzles.find(p => p.id === selectedId)!, [selectedId]);

  // Creamos sesión cada vez que cambia el puzzle
  const session = useMemo(() => createSession<any>(puzzle as any), [puzzle]);

  // Un state mínimo para forzar re-render cuando cambia la session interna
  const [, forceRender] = useState(0);
  const rerender = () => forceRender(n => n + 1);

  const [rawInput, setRawInput] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>(() => puzzle.validationCases.map(() => false));

  // Reset visual al cambiar puzzle
  function onChangePuzzle(id: PuzzleId) {
    setSelectedId(id);
    setRawInput("");
    setShowValidation(false);
    const newPuzzle = puzzles.find(p => p.id === id)!;
    setAnswers(newPuzzle.validationCases.map(() => false));
  }

  function coerceInput(): any {
    if (puzzle.id === "even-001") {
      const n = Number(rawInput);
      if (Number.isNaN(n)) return null;
      return n;
    }
    return rawInput;
  }

  function onTry() {
    const input = coerceInput();
    if (input === null || rawInput.trim() === "") return;
    session.tryInput(input);
    rerender();
  }

  function onHint() {
    session.revealHint();
    rerender();
  }

  function submitValidation() {
    const ok = session.submitValidation(answers);
    rerender();
    if (!ok) alert("No coincide 😅 Probá de nuevo.");
  }

  const state = session.getState();
  const visibleHints = session.getVisibleHints();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Rule Game (Test UI)</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Puzzle:
          <select
            value={selectedId}
            onChange={(e) => onChangePuzzle(e.target.value as PuzzleId)}
            style={{ marginLeft: 8, padding: 6 }}
          >
            {puzzles.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </label>

        <button onClick={() => { session.reset(); setAnswers(puzzle.validationCases.map(() => false)); rerender(); }} style={{ padding: "6px 10px" }}>
          Reset
        </button>
      </div>

      <p style={{ marginTop: 12, marginBottom: 12, opacity: 0.85 }}>
        {session.puzzle.description}
      </p>

      {state.status === "won" && (
        <div style={{ padding: 12, border: "1px solid #2a2", borderRadius: 8, marginBottom: 12 }}>
          ✅ ¡Ganaste! Validación correcta.
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={puzzle.id === "even-001" ? "Ingresá un número (ej: 4)" : 'Ingresá una palabra (ej: "hola")'}
          style={{ padding: 10, minWidth: 280 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onTry();
          }}
        />
        <button onClick={onTry} style={{ padding: "10px 14px" }}>Probar</button>
        <button onClick={onHint} style={{ padding: "10px 14px" }}>Pista</button>
        <button onClick={() => setShowValidation(v => !v)} style={{ padding: "10px 14px" }}>
          Resolver
        </button>
      </div>

      {visibleHints.length > 0 && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Pistas</b>
          <ul>
            {visibleHints.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}

      {showValidation && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Validación</b>
          <p style={{ marginTop: 6, opacity: 0.85 }}>
            Marcá cuáles casos darían ✅ (true). Los no marcados se consideran ❌ (false).
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {session.puzzle.validationCases.map((c: any, i: number) => (
              <label key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={answers[i] ?? false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAnswers(prev => {
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
            <button onClick={submitValidation} style={{ padding: "10px 14px" }}>
              Enviar validación
            </button>
            <button
              onClick={() => setAnswers(session.puzzle.validationCases.map(() => false))}
              style={{ padding: "10px 14px" }}
            >
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
