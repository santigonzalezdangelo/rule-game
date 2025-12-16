import { useEffect, useMemo, useState } from "react";
import inicio from "./content/puzzles/inicio.json";
import { loadPuzzle } from "./content/loader";
import { createSession } from "./engine";

export default function App() {
  const puzzles = useMemo(() => inicio.puzzles.map(loadPuzzle), []);
  const [index, setIndex] = useState(0);

  const puzzle = puzzles[index];
  const session = useMemo(() => createSession(puzzle), [puzzle]);

  // “forzar render” cuando cambia estado interno de session
  const [, forceRender] = useState(0);
  const rerender = () => forceRender((n) => n + 1);

  const [rawInput, setRawInput] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>(() =>
    puzzle.validationCases.map(() => false)
  );

  // Reset UI cuando cambiás de puzzle
  useEffect(() => {
    setRawInput("");
    setShowValidation(false);
    setAnswers(puzzle.validationCases.map(() => false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const state = session.getState();
  const hints = session.getVisibleHints();
  const reveal = session.getReveal();

  function onTry() {
    const res = session.tryRawInput(rawInput);
    if (!res.ok) {
      alert("Input inválido");
      return;
    }
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

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Isla 1: Inicio</h1>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={prev} disabled={index === 0} style={{ padding: "8px 12px" }}>
          ◀ Anterior
        </button>
        <button onClick={next} disabled={index === puzzles.length - 1} style={{ padding: "8px 12px" }}>
          Siguiente ▶
        </button>
        <span style={{ opacity: 0.75 }}>
          Puzzle {index + 1} / {puzzles.length}
        </span>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h2 style={{ margin: 0 }}>{puzzle.title}</h2>
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
        <button onClick={onTry} style={{ padding: "10px 14px" }}>Probar</button>
        <button onClick={onHint} style={{ padding: "10px 14px" }}>Pista</button>
        <button onClick={() => setShowValidation(v => !v)} style={{ padding: "10px 14px" }}>
          Resolver
        </button>
      </div>

      {hints.length > 0 && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <b>Pistas</b>
          <ul style={{ margin: "8px 0 0" }}>
            {hints.map((h, i) => <li key={i}>{h}</li>)}
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
                    setAnswers(prev => {
                      const copy = [...prev];
                      copy[i] = checked;
                      return copy;
                    });
                  }}
                />
                <span>Caso {i + 1}: <code>{String(c.input)}</code></span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button onClick={onSubmitValidation} style={{ padding: "10px 14px" }}>
              Enviar validación
            </button>
            <button
              onClick={() => setAnswers(puzzle.validationCases.map(() => false))}
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
