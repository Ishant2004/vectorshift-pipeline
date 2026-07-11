// outputNode.js

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const OutputNode = createNode(({ id }) => ({
  title: 'Output',
  icon: '⬆️',
  fields: [
    {
      field: 'outputName',
      dataType: 'string',
      label: 'Name',
      description: 'Variable name for the pipeline result.',
      default: id.replace('customOutput-', 'output_'),
      validations: [
        { type: 'required', message: 'A name is required' },
        { type: 'minLength', value: 2, message: 'Use at least 2 characters' },
      ],
    },
    {
      field: 'outputType',
      dataType: 'enum',
      label: 'Type',
      description: 'Kind of value this output produces.',
      options: ['Text', 'Image'],
      default: 'Text',
      validations: [{ type: 'required' }],
    },
  ],
  handles: [{ type: 'target', position: Position.Left, id: 'value' }],
}));
