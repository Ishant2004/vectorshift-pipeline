// filterNode.js
// Demonstrates: enum + string fields, an enum with LOW/MEDIUM/HIGH options,
// and a straight in→out flow.

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const FilterNode = createNode({
  title: 'Filter',
  icon: 'filter',
  fields: [
    {
      field: 'condition',
      dataType: 'enum',
      label: 'Keep rows where value',
      description: 'Comparison applied to each incoming row.',
      options: ['contains', 'equals', 'starts with', 'is not empty'],
      default: 'contains',
      validations: [{ type: 'required' }],
    },
    {
      field: 'value',
      dataType: 'string',
      label: 'Value',
      description: 'Compared against the condition above.',
      default: '',
      validations: [{ type: 'maxLength', value: 100, message: 'Keep it under 100 characters' }],
    },
    {
      field: 'priority',
      dataType: 'enum',
      label: 'Priority',
      description: 'Execution priority for this filter.',
      options: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
      validations: [{ type: 'required' }],
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'input' },
    { type: 'source', position: Position.Right, id: 'output' },
  ],
});
