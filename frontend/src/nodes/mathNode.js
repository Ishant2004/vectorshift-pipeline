// mathNode.js
// Demonstrates: an enum with {value,label} options and multiple labeled input
// handles auto-distributed on one edge.

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const MathNode = createNode({
  title: 'Math',
  icon: '🧮',
  fields: [
    {
      field: 'operation',
      dataType: 'enum',
      label: 'Operation',
      description: 'Applied to inputs a and b.',
      options: [
        { value: 'add', label: 'Add (a + b)' },
        { value: 'subtract', label: 'Subtract (a - b)' },
        { value: 'multiply', label: 'Multiply (a × b)' },
        { value: 'divide', label: 'Divide (a ÷ b)' },
      ],
      default: 'add',
      validations: [{ type: 'required' }],
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'a', label: 'a' },
    { type: 'target', position: Position.Left, id: 'b', label: 'b' },
    { type: 'source', position: Position.Right, id: 'result', label: 'result' },
  ],
});
