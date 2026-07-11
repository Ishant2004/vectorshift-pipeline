// toolbar.js

import { DraggableNode } from './draggableNode';

// Single source of truth for the palette. Adding a node to the toolbar is now
// one line here (mirrors how easy the Part 1 abstraction makes node creation).
const NODES = [
  { type: 'customInput', label: 'Input', icon: '⬇️' },
  { type: 'llm', label: 'LLM', icon: '🤖' },
  { type: 'customOutput', label: 'Output', icon: '⬆️' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'filter', label: 'Filter', icon: '🔍' },
  { type: 'math', label: 'Math', icon: '🧮' },
  { type: 'note', label: 'Note', icon: '🗒️' },
  { type: 'api', label: 'API', icon: '🌐' },
  { type: 'delay', label: 'Delay', icon: '⏱️' },
];

export const PipelineToolbar = () => {
  return (
    <div className="border-b border-surface-border bg-surface px-6 py-4 shadow-panel">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Drag a node onto the canvas
      </p>
      <div className="flex flex-wrap gap-2.5">
        {NODES.map((node) => (
          <DraggableNode key={node.type} {...node} />
        ))}
      </div>
    </div>
  );
};
