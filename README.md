<div align="center">

# 🧩 Rule Game

### Descubrí la regla. Probá hipótesis. Resolvé el desafío.

Un juego web de lógica y deducción en el que cada nivel esconde una regla que tenés que descubrir experimentando con números y palabras.

![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Estado](https://img.shields.io/badge/Estado-Prototipo-6B7280?style=flat-square)

</div>

## 🎮 ¿De qué se trata?

**Rule Game** propone resolver acertijos sin conocer de antemano la condición que determina si una respuesta es correcta o incorrecta.

En cada desafío podés enviar valores, observar la respuesta del sistema (`✅` o `❌`) y deducir qué tienen en común los casos válidos. Cuando creés haber descubierto la regla, tenés que **validar tu hipótesis** clasificando nuevos ejemplos.

La idea es aprender a razonar a partir de ejemplos, probar casos límite y reconocer patrones, en lugar de adivinar una única respuesta.

## ✨ Funcionalidades

- **9 puzzles distribuidos en 3 islas** con dificultad progresiva.
- **Reglas sobre números y palabras**, desde paridad y divisibilidad hasta condiciones sobre texto.
- **Operadores lógicos `AND` y `OR`** para combinar reglas en los niveles más avanzados.
- **Sistema de pistas** que permite obtener ayuda durante cada desafío.
- **Validación de hipótesis** mediante casos que el jugador marca como verdaderos o falsos.
- **Sistema de puntuación** que considera intentos, pistas utilizadas y tiempo transcurrido.
- **Desbloqueo progresivo de islas** al completar los puzzles de la anterior.
- **Guardado local del progreso**, incluyendo puzzles resueltos y mejor puntuación por nivel.

### 🗺️ Islas disponibles

| Isla | Contenido | Desafíos |
| --- | --- | ---: |
| **01 · Inicio** | Primer contacto con las reglas: paridad, longitud de palabras y comparaciones. | 3 |
| **02 · Primeros Pasos** | Vocales, números positivos, divisibilidad y conteos. | 4 |
| **03 · Fundamentos** | Combinación de condiciones con operadores `AND` y `OR`. | 2 |

## 🕹️ Cómo jugar

1. Seleccioná un puzzle de la isla disponible.
2. Escribí un número o una palabra y presioná **Probar**.
3. Analizá el resultado y repetí con otros valores para descubrir el patrón.
4. Si lo necesitás, usá el botón **Pista**.
5. Cuando tengas una hipótesis, presioná **Resolver** y marcá qué casos deberían dar `✅`.
6. Si la validación es correcta, se revela la regla y obtenés tu puntuación.

> **Ejemplo:** si un desafío acepta `2`, `4` y `6`, pero rechaza `3` y `5`, una posible hipótesis es que solo acepta números pares. La validación te permite comprobarlo con otros casos.

## 🛠️ Tecnologías

| Tecnología | Uso |
| --- | --- |
| **React 19** | Interfaz y componentes interactivos. |
| **TypeScript** | Tipado del motor de juego, reglas y estado. |
| **Vite 7** | Entorno de desarrollo y compilación. |
| **JSON** | Definición de puzzles, pistas y condiciones. |
| **localStorage** | Persistencia del progreso en el navegador. |

El proyecto funciona **completamente del lado del cliente**: no necesita backend ni base de datos para ejecutarse.

## 🚀 Instalación y ejecución

**Requisitos:** Node.js compatible con Vite 7 (20.19+ o 22.12+) y npm.

```bash
# Clonar el repositorio
git clone https://github.com/santigonzalezdangelo/rule-game.git
cd rule-game

# Instalar dependencias
npm ci

# Iniciar el entorno de desarrollo
npm run dev
```

Abrí la dirección local que muestra Vite en la terminal (normalmente `http://localhost:5173`).

### Otros comandos

```bash
npm run build    # Comprobar tipos y generar la versión de producción
npm run preview  # Previsualizar la compilación local
npm run lint     # Ejecutar ESLint
```

## 🧠 Diseño y arquitectura

La lógica de juego está **separada de la interfaz**: los puzzles se definen como datos, un cargador los convierte a objetos ejecutables y el motor gestiona intentos, pistas, validaciones y puntuaciones.

```text
src/
├── App.tsx                    # Interfaz, navegación y persistencia
├── content/
│   ├── puzzles/               # Conjuntos de niveles definidos en JSON
│   ├── rules.ts               # Reglas base y casos de validación
│   ├── loader.ts              # Convierte JSON en puzzles ejecutables
│   └── logicBuilders.ts       # Construye expresiones lógicas compuestas
└── engine/
    ├── session.ts             # Estado y acciones de una partida
    ├── logic.ts               # Evaluación de condiciones lógicas
    ├── validation.ts          # Verificación de hipótesis
    ├── scoring.ts             # Cálculo de la puntuación
    └── types.ts               # Contratos y tipos del dominio
```

### Reglas declarativas

Los desafíos se describen en archivos JSON, sin necesidad de crear una pantalla diferente para cada uno. Por ejemplo, la tercera isla combina reglas existentes:

```json
{
  "id": "fund-01",
  "title": "AND básico",
  "difficulty": "easy",
  "logic": {
    "condition": "and",
    "rules": ["isEven", "isPositive"]
  }
}
```

El motor interpreta esa condición como **«es par Y es positivo»**. Las reglas simples se implementan con funciones de parseo y evaluación reutilizables.

Internamente, el evaluador también contempla expresiones `NOT` y `XOR`, aunque **los niveles publicados actualmente usan `AND` y `OR`** para las combinaciones.

### Puntuación

Cada puzzle parte de **1.000 puntos**. Al completarlo, se descuentan:

- **50 puntos** por intento.
- **120 puntos** por pista utilizada.
- **10 puntos** por cada bloque completo de 10 segundos transcurridos.

El puntaje mínimo es **0**. El mejor resultado de cada nivel se almacena en `localStorage`, junto con el progreso y la isla seleccionada.

## 🚧 Estado del proyecto

El motor, los nueve niveles y el guardado del progreso están implementados. La interfaz actual es una **UI de pruebas** enfocada en validar la mecánica de juego; todavía utiliza estilos básicos y no cuenta con una suite de pruebas automatizadas.

**Posibles mejoras:** una interfaz visual propia, más islas y tipos de reglas, pruebas unitarias del motor y capturas o una demo jugable para mostrar el proyecto.

---

<div align="center">

Desarrollado por [Santiago González D'Angelo](https://github.com/santigonzalezdangelo).

</div>
