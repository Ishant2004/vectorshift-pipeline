// Dropdown.js
// A custom select control (replaces the native <select>) styled to match the
// design system. `nodrag`/`nowheel` keep clicks and scrolling from being
// hijacked by React Flow's pan/drag behavior.

import { useEffect, useRef, useState } from 'react';

const toItem = (opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt);

export const Dropdown = ({ value, options = [], onChange, invalid }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const items = options.map(toItem);
  const selected = items.find((item) => item.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  return (
    <div className="nodrag relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-md border bg-white
                    px-2.5 py-1.5 text-left text-[13px] text-ink outline-none transition
                    hover:border-brand-400 focus:ring-2 focus:ring-brand-100
                    ${invalid ? 'border-red-400' : 'border-rule-dk'}`}
      >
        <span className="truncate">{selected ? selected.label : value}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          className="nowheel absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto
                     rounded-md border border-surface-border bg-white py-1 shadow-lg"
        >
          {items.map((item) => {
            const active = item.value === value;
            return (
              <li
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-2.5 py-1.5 text-[13px] transition
                            ${active ? 'bg-brand-50 font-medium text-brand-700' : 'text-ink hover:bg-surface-muted'}`}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
