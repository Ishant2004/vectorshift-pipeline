// nodeStyles.js
// --------------------------------------------------
// Shared Tailwind class strings for every node. Because all nodes read from
// this single file, restyling the entire node library (colors, spacing,
// borders, handle appearance) is a one-place change instead of edits across
// N files.

export const nodeClasses = {
  container:
    'relative min-w-[220px] rounded-xl border border-surface-border bg-surface ' +
    'shadow-node transition-shadow duration-150 hover:shadow-node-hover',
  header:
    'flex items-center gap-2 rounded-t-xl border-b border-brand-700 ' +
    'bg-brand-600 px-3 py-2 text-[13px] font-semibold text-white',
  accentBar: 'h-4 w-1 rounded-full bg-white/80',
  icon: 'text-base leading-none',
  body: 'flex flex-col gap-2.5 p-3',
  field: 'flex flex-col gap-1',
  label: 'node-label',
  required: 'text-red-500',
  hint: 'text-[10px] leading-snug text-ink-faint',
  error: 'text-[10px] font-medium text-red-500',
  input: 'node-input',
  inputError: '!border-red-400 focus:!ring-red-100',
  textarea: 'node-input resize-y min-h-[64px]',
  autoTextarea: 'node-input resize-none overflow-hidden leading-snug',
  objectGroup: 'flex flex-col gap-2 rounded-md border border-dashed border-rule-dk bg-surface-muted/60 p-2',
  text: 'text-[13px] text-ink-soft',
  checkboxRow: 'flex items-center gap-2',
  checkbox: 'h-4 w-4 rounded border-rule-dk text-brand-600 focus:ring-brand-500',
  checkboxLabel: 'text-[13px] text-ink-soft select-none',
  handle: '!h-2.5 !w-2.5 !bg-brand-500 !border-2 !border-white',
  handleLabel:
    'pointer-events-none absolute z-10 bg-white px-1 text-[10px] text-ink-faint',
};
