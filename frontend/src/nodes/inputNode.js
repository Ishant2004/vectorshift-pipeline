// inputNode.js

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const InputNode = createNode(({ id }) => ({
  title: 'Input',
  icon: 'input',
  fields: [
    {
      field: 'inputName',
      dataType: 'string',
      label: 'Name',
      description: 'Variable name exposed to the pipeline.',
      default: id.replace('customInput-', 'input_'),
      validations: [
        { type: 'required', message: 'A name is required' },
        { type: 'minLength', value: 2, message: 'Use at least 2 characters' },
        {
          type: 'pattern',
          value: '^[A-Za-z_$][A-Za-z0-9_$]*$',
          message: 'Must be a valid variable name',
        },
      ],
    },
    {
      field: 'inputType',
      dataType: 'enum',
      label: 'Type',
      description: 'Kind of value this input carries.',
      options: ['Text', 'File'],
      default: 'Text',
      validations: [{ type: 'required' }],
    },
  ],
  handles: [{ type: 'source', position: Position.Right, id: 'value' }],
}));
