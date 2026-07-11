// noteNode.js
// Demonstrates: a multiline text field and a node with NO handles.

import { createNode } from './BaseNode';

export const NoteNode = createNode({
  title: 'Note',
  icon: '🗒️',
  fields: [
    {
      field: 'note',
      dataType: 'text',
      label: 'Note',
      description: 'Free-form annotation for your pipeline.',
      rows: 4,
      default: 'Add a comment about your pipeline...',
      validations: [{ type: 'maxLength', value: 500, message: 'Keep notes under 500 characters' }],
    },
  ],
  handles: [],
});
