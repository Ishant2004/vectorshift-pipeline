// apiNode.js
// Demonstrates: pattern validation, an enum, and a nested `schema_config`
// object field (auth) with its own sub-fields and validations.

import { Position } from 'reactflow';
import { createNode } from './BaseNode';

export const ApiNode = createNode({
  title: 'API Request',
  icon: '🌐',
  fields: [
    {
      field: 'url',
      dataType: 'string',
      label: 'URL',
      description: 'Endpoint to call.',
      default: 'https://api.example.com',
      validations: [
        { type: 'required', message: 'A URL is required' },
        { type: 'pattern', value: '^https?://', message: 'Must start with http:// or https://' },
      ],
    },
    {
      field: 'method',
      dataType: 'enum',
      label: 'Method',
      description: 'HTTP request method.',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'GET',
      validations: [{ type: 'required' }],
    },
    {
      field: 'auth',
      dataType: 'object',
      label: 'Auth',
      description: 'Optional authentication settings.',
      schema_config: {
        properties: {
          type: {
            field: 'type',
            dataType: 'enum',
            label: 'Scheme',
            options: ['none', 'bearer', 'basic'],
            default: 'none',
          },
          token: {
            field: 'token',
            dataType: 'string',
            label: 'Token',
            description: 'Sent as the Authorization header.',
            default: '',
            validations: [{ type: 'maxLength', value: 200 }],
          },
        },
      },
    },
  ],
  handles: [
    { type: 'target', position: Position.Left, id: 'trigger', label: 'trigger' },
    { type: 'source', position: Position.Right, id: 'response', label: 'response' },
  ],
});
