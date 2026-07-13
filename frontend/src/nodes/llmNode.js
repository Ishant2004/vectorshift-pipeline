// llmNode.js

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const LLMNode = createNode({
  title: 'LLM',
  icon: 'llm',
  fields: [
    {
      field: 'model',
      dataType: 'enum',
      label: 'Model',
      description: 'Language model used for generation.',
      options: ['claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5'],
      default: 'claude-sonnet-5',
      validations: [{ type: 'required' }],
    },
    {
      field: 'temperature',
      dataType: 'number',
      label: 'Temperature',
      description: 'Sampling randomness (0–2).',
      default: 0.7,
      validations: [
        { type: 'required', message: 'Temperature is required' },
        { type: 'min', value: 0, message: 'Must be at least 0' },
        { type: 'max', value: 2, message: 'Must be at most 2' },
      ],
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'system', label: 'system' },
    { type: 'target', position: Position.Left, id: 'prompt', label: 'prompt' },
    { type: 'source', position: Position.Right, id: 'response', label: 'response' },
  ],
});
