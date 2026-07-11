# Architecture

This document explains how the VectorShift Pipeline Builder is put together —
the data flow, the node abstraction, and what happens on each user action. For
setup and deployment see [README.md](README.md).

---

## 1. Mental model

The whole app rests on one idea:

> **The Zustand store is the single source of truth. React Flow is a
> *controlled* component driven by it.**

React Flow never owns the data. It renders whatever `nodes` / `edges` you hand
it, and when the user does something (drag, connect, delete, move) it does **not**
mutate anything itself — it emits a *change event*. A store handler applies that
change back into the array, the store updates, and React Flow re-renders. Every
interaction is that same round-trip.

```
        ┌─────────────────────────────────────────────┐
        │            Zustand store (store.js)          │
        │   nodes[]   edges[]   nodeIDs{}   actions()  │
        └───────────────▲───────────────┬──────────────┘
         actions write  │               │  state read
        (onNodesChange, │               │ (nodes, edges)
         onConnect, …)  │               ▼
        ┌───────────────┴──────────────────────────────┐
        │             <ReactFlow>  (ui.js)              │
        │  renders node.type → nodeTypes → BaseNode     │
        │  emits: onNodesChange / onEdgesChange /       │
        │         onConnect / onDrop                    │
        └───────────────────────────────────────────────┘
                        │  POST { nodes, edges }
                        ▼
        ┌───────────────────────────────────────────────┐
        │        FastAPI backend  (/pipelines/parse)     │
        │   main → routes → services → dag / models      │
        └───────────────────────────────────────────────┘
```

---

## 2. Frontend layers

| Layer | Files | Responsibility |
| ----- | ----- | -------------- |
| State | [`store.js`](frontend/src/store.js) | Zustand store: `nodes`, `edges`, and all mutation actions |
| Canvas | [`ui.js`](frontend/src/ui.js) | Hosts `<ReactFlow>`, registers `nodeTypes`, wires drop/change handlers |
| Palette | [`toolbar.js`](frontend/src/toolbar.js), [`draggableNode.js`](frontend/src/draggableNode.js) | Draggable source chips |
| Node engine | [`nodes/BaseNode.js`](frontend/src/nodes/BaseNode.js) | Renders every node from a config; owns field state + handles |
| Schema | [`nodes/fieldSchema.js`](frontend/src/nodes/fieldSchema.js) | Field types, validation engine, helpers |
| Node specs | [`nodes/*Node.js`](frontend/src/nodes) | One declarative config per node type |
| Submit | [`submit.js`](frontend/src/submit.js) | POSTs the pipeline, shows the result |

### The store

[`store.js`](frontend/src/store.js) exposes the state and the actions that React
Flow calls:

- `getNodeID(type)` — per-type counter (`text-1`, `text-2`, …) via `nodeIDs`.
- `addNode(node)` — append a node.
- `onNodesChange(changes)` — `applyNodeChanges` (position, selection, removal…).
- `onEdgesChange(changes)` — `applyEdgeChanges`.
- `onConnect(connection)` — `addEdge` with `smoothstep` + animation + arrow.
- `updateNodeField(id, field, value)` — merge a field value into `node.data`.

Consumers subscribe with a selector + `shallow` equality so components only
re-render when the slices they read actually change.

---

## 3. The node abstraction

Every node is created by `createNode(config)`
([BaseNode.js](frontend/src/nodes/BaseNode.js)), a factory that wraps a config in
a component:

```js
export const createNode = (config) => ({ id, data }) =>
  <BaseNode id={id} data={data} config={config} />;
```

So a node file is *only* a config (see [`inputNode.js`](frontend/src/nodes/inputNode.js)).
`BaseNode` does all shared work:

1. **Resolves the config** — object, or a function of `{ id, data }` when a
   default must derive from the id (e.g. `input_1`).
2. **Lifts field state up** — a single `values` object held in `BaseNode`, not in
   each input. *This is the key decision that lets handles depend on field
   content.*
3. **`setValue`** — updates `values` **and** mirrors into the store via
   `updateNodeField`, so `node.data` always reflects what's typed.
4. **Computes handles** — `config.handles` may be a static array *or* a function
   of `{ id, data, values }`.
5. **`useUpdateNodeInternals`** — when the handle set changes, tells React Flow to
   re-measure so edges reattach correctly.
6. **Renders** container, header (accent bar + icon + title), each field via
   `NodeField`, and the handles (grouped per side and evenly distributed).

React Flow picks the component by looking up `node.type` in the `nodeTypes` map
([ui.js](frontend/src/ui.js)).

### The field schema

A node's `fields` array **is** its input schema. Each field declares:

```js
{
  field: 'temperature',            // identifier (alias: name)
  dataType: 'number',              // string|text|number|boolean|enum|object
  label: 'Temperature',
  description: 'Sampling randomness',
  default: 0.7,
  options: ['LOW', 'MEDIUM', 'HIGH'],           // enum
  validations: [{ type: 'min', value: 0 }, …],  // required|minLength|maxLength|min|max|pattern
  schema_config: { properties: { … } },         // object → nested fields
}
```

`fieldSchema.js` maps `dataType` → control, and `validateField(field, value)`
runs the rules live on every keystroke. The first error renders in red and the
input gets a red border. Nested `object` fields render recursively (see the API
node's `auth`). Validation is advisory — it does not block Submit.

---

## 4. Lifecycle walkthroughs

### Create a node (drag from palette)

1. `DraggableNode.onDragStart` writes `{ nodeType }` into `dataTransfer`.
2. Canvas `onDragOver` calls `preventDefault()` (required to allow a drop).
3. Canvas `onDrop` ([ui.js](frontend/src/ui.js)):
   - reads the payload,
   - `reactFlowInstance.project(...)` converts screen → canvas coords (respecting pan/zoom),
   - `getNodeID(type)` makes a unique id,
   - builds `{ id, type, position, data: { id, nodeType } }` and calls `addNode`.
4. Store appends → React Flow renders the new node via `nodeTypes`.

### Create an edge

Dragging between two `<Handle>`s fires **`onConnect`** with
`{ source, target, sourceHandle, targetHandle }`. `store.onConnect` runs
`addEdge(...)`, adding a styled animated edge to `edges[]`.

### Edit a field

`NodeField.onChange` → `BaseNode.setValue` → updates local `values` **and**
`updateNodeField(id, key, value)` in the store. The store copy is what gets
submitted.

### Text node — inputs grow with `{{ variables }}`

`textNode.js` defines `handles` as a function of `{ values }`:

1. Typing updates `values.text`.
2. `BaseNode` re-runs `handles`, calling `extractVariables(values.text)`
   (regex `/\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g`, deduped) → one target
   handle per valid, unique variable.
3. The handle set changed → `updateNodeInternals(id)` re-measures so edges stay
   attached.
4. The auto-size textarea grows via a `useLayoutEffect` (height = `scrollHeight`,
   width = longest line).

Invalid identifiers (`{{ 1bad }}`, `{{ a-b }}`) are ignored; duplicates collapse.

### Delete a node

Select + Backspace/Delete → React Flow emits a `remove` change through
**`onNodesChange`**; `applyNodeChanges` drops it. React Flow also emits `remove`
changes for the node's connected edges through **`onEdgesChange`**, so nothing
dangles.

### Move / zoom / pan / lock

- **Move** — dragging emits `position` changes via `onNodesChange`;
  `snapGrid={[20,20]}` snaps to a 20px grid.
- **Zoom / pan** — React Flow viewport transform (wheel / `+`,`−` buttons / drag
  on empty canvas). `<Controls>` also offers *fit view*.
- **Lock** 🔒 — the padlock in `<Controls>` toggles interactivity
  (`nodesDraggable`, `nodesConnectable`, `elementsSelectable`). Locked = can't
  move/connect/select nodes, but pan & zoom still work.
- **MiniMap** — a scaled overview of all nodes for navigation.

---

## 5. Submit — and the payload

[`submit.js`](frontend/src/submit.js) reads `nodes` + `edges` from the store and
POSTs them:

```js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
fetch(`${API_BASE}/pipelines/parse`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nodes, edges }),
});
```

The response `{ num_nodes, num_edges, is_dag }` is shown in an alert.

**What's actually sent** — the store's full `nodes` and `edges`. A node carries
its current field values (mirrored in by `updateNodeField`) plus fields React
Flow attaches:

```json
{
  "id": "text-1", "type": "text",
  "position": { "x": 240, "y": 120 },
  "data": { "id": "text-1", "nodeType": "text", "text": "Hi {{name}}" },
  "width": 220, "height": 96, "selected": false, "dragging": false
}
```

An edge:

```json
{ "source": "text-1", "target": "llm-1",
  "sourceHandle": "text-1-output", "targetHandle": "llm-1-prompt",
  "type": "smoothstep", "animated": true }
```

The backend reads only `node.id` and each edge's `source` / `target`; all
geometry/styling fields are ignored.

---

## 6. Backend

A modular FastAPI app — each concern in its own file:

```
main.py        app creation, middleware + router wiring, GET / health check
config.py      env-driven settings (dotenv): ALLOWED_ORIGINS, PORT
middleware.py  CORS registration
routes.py      /pipelines APIRouter
services.py    parse_pipeline() business logic
dag.py         is_dag() — Kahn's algorithm
models.py      Pipeline (request) + HealthResponse + ParseResponse
```

Request flow: `main` includes the `routes` router → the handler calls
`services.parse_pipeline` → which calls `dag.is_dag` → returns a typed
`ParseResponse`.

`is_dag` builds an adjacency list + in-degree map over the node ids, then peels
off zero-in-degree nodes (Kahn's algorithm). If every node is removed there is
no cycle → it's a DAG. Self-loops and back-edges are correctly flagged; edges to
unknown node ids are ignored.

---

## 7. Configuration & environments

Same code, different environment variables (see the
[README env table](README.md#environment-variables)):

- **Frontend** `REACT_APP_API_URL` — backend base URL, **embedded at build time**
  by Create React App (a redeploy is needed after changing it).
- **Backend** `ALLOWED_ORIGINS` — comma-separated CORS origins; `config.py` reads
  it (defaults to `*`). CORS matching is exact — the deployed value must equal the
  frontend origin (`https://…`, no trailing slash).
- **Backend** `PORT` — Railway injects it; `Procfile` binds uvicorn to it.

---

## 8. Quality gates

- **Tests** — pytest ([`backend/tests`](backend/tests)) and Jest + RTL
  ([`frontend/src/__tests__`](frontend/src/__tests__),
  [`frontend/src/nodes/__tests__`](frontend/src/nodes/__tests__)). They cover the
  pure logic (DAG detection, validation engine, variable extraction, store
  reducers) and the two integration seams (the parse API and the submit flow).
- **CI** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml): tests on every
  push/PR; ruff + ESLint lint on PRs.

---

## Where to look first

- Understand a node → [`nodes/BaseNode.js`](frontend/src/nodes/BaseNode.js) +
  any [`nodes/*Node.js`](frontend/src/nodes).
- Understand state/interactions → [`store.js`](frontend/src/store.js) +
  [`ui.js`](frontend/src/ui.js).
- Understand the API → [`backend/routes.py`](backend/routes.py) →
  [`services.py`](backend/services.py) → [`dag.py`](backend/dag.py).
