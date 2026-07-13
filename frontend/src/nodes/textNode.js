// textNode.js
//
// Demonstrates the two dynamic capabilities of the abstraction:
//   1. `autoSize` — the text field (and therefore the node) grows as the user
//      types more text.
//   2. Reactive handles — a function that reads the live field values and adds
//      one left-side target Handle for every `{{ variable }}` referenced in
//      the text. Only valid JavaScript identifiers count.

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

// Match {{ name }} where `name` is a valid JS identifier (optionally spaced).
const VARIABLE_PATTERN = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

export const extractVariables = (text = '') => [
  ...new Set([...String(text).matchAll(VARIABLE_PATTERN)].map((m) => m[1])),
];

export const TextNode = createNode({
  title: 'Text',
  icon: 'text',
  fields: [
    {
      field: 'text',
      dataType: 'text',
      label: 'Text',
      description: 'Reference inputs with {{ variableName }}.',
      autoSize: true,
      default: '{{input}}',
      validations: [{ type: 'required', message: 'Text cannot be empty' }],
    },
  ],
  handles: ({ values }) => [
    // One input handle per referenced variable...
    ...extractVariables(values.text).map((name) => ({
      type: 'target',
      position: Position.Left,
      id: name,
      label: name,
    })),
    // ...plus the node's single text output.
    { type: 'source', position: Position.Right, id: 'output' },
  ],
});
