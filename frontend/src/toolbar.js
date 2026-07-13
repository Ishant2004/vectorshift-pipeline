// toolbar.js

import { DraggableNode } from './draggableNode';

// Single source of truth for the palette. Adding a node to the toolbar is now
// one line here (mirrors how easy the Part 1 abstraction makes node creation).
const NODES = [
  { type: 'customInput', label: 'Input', icon: 'input' },
  { type: 'llm', label: 'LLM', icon: 'llm' },
  { type: 'customOutput', label: 'Output', icon: 'output' },
  { type: 'text', label: 'Text', icon: 'text' },
  { type: 'filter', label: 'Filter', icon: 'filter' },
  { type: 'math', label: 'Math', icon: 'math' },
  { type: 'note', label: 'Note', icon: 'note' },
  { type: 'api', label: 'API', icon: 'api' },
  { type: 'delay', label: 'Delay', icon: 'delay' },
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
