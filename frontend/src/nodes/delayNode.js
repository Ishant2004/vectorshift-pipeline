// delayNode.js
// Demonstrates: number field with min/max validation + a boolean field.

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const DelayNode = createNode({
  title: 'Delay',
  icon: 'delay',
  fields: [
    {
      field: 'seconds',
      dataType: 'number',
      label: 'Seconds',
      description: 'How long to wait before continuing.',
      default: 5,
      validations: [
        { type: 'required', message: 'Duration is required' },
        { type: 'min', value: 0, message: 'Cannot be negative' },
        { type: 'max', value: 3600, message: 'Max is 3600 seconds' },
      ],
    },
    {
      field: 'blocking',
      dataType: 'boolean',
      checkboxLabel: 'Block downstream nodes',
      description: 'Pause the whole pipeline while waiting.',
      default: true,
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'input' },
    { type: 'source', position: Position.Right, id: 'output' },
  ],
});
