# VectorShift — Pipeline Builder

A visual, node-based pipeline editor. Drag nodes onto a canvas, wire them
together, and submit the graph to a FastAPI backend that reports the node/edge
counts and whether the pipeline is a valid DAG.

Built as a React frontend (React Flow + Zustand + Tailwind CSS) and a modular
FastAPI backend.

---

## Highlights

- **Config-driven node abstraction** — every node is a small declarative spec
  (`createNode({ ... })`); shared chrome, form controls, and connection handles
  are rendered by a single `BaseNode`. Adding a node is ~20 lines.
- **Formal input schema** — each field declares a `dataType`, `description`,
  `options`, and `validations` (required / minLength / maxLength / min / max /
  pattern), plus nested objects via `schema_config`. Validation runs live in the
  UI.
- **Unified Tailwind design** — dark top bar, draggable node palette, styled
  nodes with accent headers, and themed React Flow canvas/handles/edges.
- **Smart Text node** — auto-resizes as you type and creates a left-side input
  handle for every `{{ variableName }}` reference.
- **Backend integration** — the Submit button POSTs the pipeline; the backend
  returns `{ num_nodes, num_edges, is_dag }`, surfaced in a friendly alert.
- **Test suites** — pytest for the backend, Jest + React Testing Library for the
  frontend.

---

## Tech stack

| Layer     | Tools                                                        |
| --------- | ----------------------------------------------------------- |
| Frontend  | React (Create React App), React Flow, Zustand, Tailwind CSS |
| Backend   | FastAPI, Uvicorn, Pydantic                                  |
| Testing   | Jest + React Testing Library, pytest + httpx                |

---

## Project structure

```
.
├── frontend/                     # React app
│   ├── src/
│   │   ├── App.js                # app shell / layout
│   │   ├── toolbar.js            # draggable node palette
│   │   ├── draggableNode.js      # a palette chip
│   │   ├── ui.js                 # React Flow canvas + node registration
│   │   ├── store.js              # Zustand store (nodes, edges, actions)
│   │   ├── submit.js             # Submit button → backend + alert
│   │   ├── nodes/
│   │   │   ├── BaseNode.js       # core abstraction + createNode() factory
│   │   │   ├── fieldSchema.js    # field schema + validation engine
│   │   │   ├── nodeStyles.js     # shared node style tokens (Tailwind)
│   │   │   ├── inputNode.js  outputNode.js  textNode.js  llmNode.js
│   │   │   └── filterNode.js  mathNode.js  noteNode.js  apiNode.js  delayNode.js
│   │   └── __tests__/ , nodes/__tests__/
│   └── package.json
│
└── backend/                      # FastAPI app
    ├── main.py                   # app wiring + health check route
    ├── middleware.py             # CORS setup
    ├── routes.py                 # /pipelines router
    ├── services.py               # business logic (parse_pipeline)
    ├── dag.py                    # is_dag() — Kahn's algorithm
    ├── models.py                 # request + per-route response models
    ├── requirements.txt          # runtime deps
    ├── requirements-dev.txt      # test deps (pytest, httpx)
    └── tests/                    # pytest suite
```

---

## Getting started

**Prerequisites:** Node.js 16+ and Python 3.9+.

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate           # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload          # serves http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start                          # serves http://localhost:3000
```

Open http://localhost:3000, drag nodes onto the canvas, connect them, and click
**Submit Pipeline**.

---

## Testing

**Backend**

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

**Frontend**

```bash
cd frontend
npm test                           # watch mode
CI=true npm test                   # single run
```

---

## API

Base URL: `http://localhost:8000`

| Method | Path               | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/`                | Health check → `{ "Ping": "Pong" }`  |
| POST   | `/pipelines/parse` | Analyze a pipeline (see below)       |

**`POST /pipelines/parse`**

Request:

```json
{ "nodes": [ { "id": "..." } ], "edges": [ { "source": "...", "target": "..." } ] }
```

Response:

```json
{ "num_nodes": 3, "num_edges": 2, "is_dag": true }
```

Interactive docs are available at `http://localhost:8000/docs`.

---

## Creating a new node

Add a file in `frontend/src/nodes/` and register it in `ui.js` (node types) and
`toolbar.js` (palette):

```js
import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const MyNode = createNode({
  title: 'My Node',
  icon: '✨',
  fields: [
    {
      field: 'name',
      dataType: 'string',
      label: 'Name',
      description: 'What this field is for',
      default: '',
      validations: [{ type: 'required', message: 'Name is required' }],
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'in' },
    { type: 'source', position: Position.Right, id: 'out' },
  ],
});
```

See `nodes/fieldSchema.js` for the full field schema and supported validation
rules.
