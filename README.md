# VectorShift — Pipeline Builder

A visual, node-based pipeline editor. Drag nodes onto a canvas, wire them
together, and submit the graph to a FastAPI backend that reports the node/edge
counts and whether the pipeline is a valid DAG.

Built as a React frontend (React Flow + Zustand + Tailwind CSS) and a modular
FastAPI backend.

> For a deep dive into how it all fits together — data flow, the node
> abstraction, and what happens on each user action — see
> [ARCHITECTURE.md](ARCHITECTURE.md).

## Live demo

- **Frontend (Vercel):** https://vectorshift-pipeline-tau.vercel.app
- **Backend (Railway):** https://vectorshift-pipeline-production.up.railway.app

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
- **Env-driven config** — one codebase runs locally and in production; the API
  URL and CORS origins come from environment variables.
- **Tested & linted in CI** — pytest + Jest run on every push; ruff + ESLint
  gate pull requests via GitHub Actions.

---

## Tech stack

| Layer      | Tools                                                        |
| ---------- | ----------------------------------------------------------- |
| Frontend   | React (Create React App), React Flow, Zustand, Tailwind CSS |
| Backend    | FastAPI, Uvicorn, Pydantic                                  |
| Testing    | Jest + React Testing Library, pytest + httpx                |
| Linting    | ESLint (react-app config), Ruff                             |
| CI/CD      | GitHub Actions                                              |
| Deployment | Vercel (frontend), Railway (backend)                        |

---

## Project structure

```
.
├── .github/workflows/ci.yml      # CI: tests on every push, lint on PRs
│
├── frontend/                     # React app  → deployed to Vercel
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
│   ├── .env.example              # frontend env template
│   ├── vercel.json               # Vercel build/SPA config
│   └── package.json
│
└── backend/                      # FastAPI app  → deployed to Railway
    ├── main.py                   # app wiring + health check route
    ├── config.py                 # env-driven settings (dotenv)
    ├── middleware.py             # CORS setup
    ├── routes.py                 # /pipelines router
    ├── services.py               # business logic (parse_pipeline)
    ├── dag.py                    # is_dag() — Kahn's algorithm
    ├── models.py                 # request + per-route response models
    ├── requirements.txt          # runtime deps
    ├── requirements-dev.txt      # test/lint deps (pytest, httpx, ruff)
    ├── ruff.toml                 # lint config
    ├── Procfile                  # Railway start command
    ├── .env.example              # backend env template
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
cp .env.example .env               # local settings
uvicorn main:app --reload          # serves http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env               # points at http://localhost:8000
npm start                          # serves http://localhost:3000
```

Open http://localhost:3000, drag nodes onto the canvas, connect them, and click
**Submit Pipeline**.

---

## Environment variables

The same code runs locally and in production; only these variables change.
Locally they live in `.env` files (gitignored — copy from `.env.example`); in
production they are set in the Vercel / Railway dashboards.

| Where    | Variable             | Local                   | Production                                  |
| -------- | -------------------- | ----------------------- | ------------------------------------------- |
| Frontend | `REACT_APP_API_URL`  | `http://localhost:8000` | your Railway backend URL                    |
| Backend  | `ALLOWED_ORIGINS`    | `*`                     | your Vercel frontend URL (comma-separated)  |
| Backend  | `PORT`               | `8000`                  | set automatically by Railway                |

> `REACT_APP_API_URL` is embedded at **build time** (Create React App), so a
> redeploy is required after changing it.

---

## Testing

**Backend** (pytest)

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

**Frontend** (Jest + React Testing Library)

```bash
cd frontend
npm test                           # watch mode
CI=true npm test                   # single run
```

---

## Linting

```bash
cd backend && ruff check .         # Python
cd frontend && npm run lint        # ESLint (fails on warnings)
```

---

## Continuous integration

`.github/workflows/ci.yml` runs on GitHub Actions:

- **On every push and PR:** backend tests (`pytest`) and frontend tests (`jest`).
- **On pull requests:** backend lint (`ruff`) and frontend lint (`eslint`).

To require these before merging, enable branch protection on `main`
(**Settings → Branches**) and select the four checks as required.

---

## Deployment

The frontend and backend deploy independently from the same `main` branch.

### Backend → Railway

1. New Project → **Deploy from GitHub repo**.
2. Service **Settings → Root Directory** → set to `backend` (so Railway finds
   `requirements.txt` and `Procfile`).
3. **Variables** → add `ALLOWED_ORIGINS` = your Vercel URL. Do **not** set
   `PORT` (Railway injects it).
4. Deploy, then copy the public URL.

The start command is defined in `backend/Procfile`:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend → Vercel

1. New Project → import the same repo.
2. **Root Directory** → set to `frontend`.
3. **Environment Variables** → `REACT_APP_API_URL` = the Railway URL (no
   trailing slash).
4. Deploy, then copy the Vercel URL.

### Connect them (CORS)

Set the backend's `ALLOWED_ORIGINS` to the **exact** Vercel origin and redeploy:

```
ALLOWED_ORIGINS = https://your-app.vercel.app
```

> CORS matching is exact — no trailing slash, no path, and `https://` (not
> `http://`). A mismatch shows as "Could not reach the backend / Failed to
> fetch" in the browser. Alternatively use `ALLOWED_ORIGINS=*`.

**Recommended order:** deploy Railway first (to get the backend URL for Vercel),
then Vercel, then update Railway's `ALLOWED_ORIGINS` with the Vercel URL.

---

## API

Base URL: `http://localhost:8000` (local) — interactive docs at `/docs`.

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
