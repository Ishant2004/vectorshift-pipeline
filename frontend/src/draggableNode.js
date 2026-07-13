// draggableNode.js

import { NodeIcon } from './nodes/icons';

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = 'grabbing';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={
        `${type} group flex min-w-[92px] cursor-grab select-none flex-col ` +
        'items-center justify-center gap-1 rounded-lg border border-brand-500/40 ' +
        'bg-brand-600 px-3 py-2.5 text-white shadow-sm transition ' +
        'hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-node-hover ' +
        'active:cursor-grabbing active:translate-y-0'
      }
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={(event) => (event.target.style.cursor = 'grab')}
      draggable
    >
      {icon && <NodeIcon name={icon} className="h-5 w-5" />}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};
