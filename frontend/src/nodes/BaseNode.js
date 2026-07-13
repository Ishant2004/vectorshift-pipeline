// BaseNode.js
// --------------------------------------------------
// The core node abstraction.
//
// Every node in the app is described by a small, declarative config object
// (title, fields, handles). `BaseNode` reads that config and renders the
// shared chrome (container, header, form fields, connection handles) so that
// individual node files contain *only* what makes them unique.
//
// Field state is lifted into BaseNode and exposed as a `values` map, which
// lets a node compute its handles reactively from what the user has typed.
// `handles` may therefore be a static array OR a function of
// ({ id, data, values }) — this is what powers the Text node's variable
// handles (see textNode.js). Fields also support `autoSize` for inputs that
// grow with their content.
//
// Each field follows the shared input schema (see fieldSchema.js): a field
// identifier, a data type, an optional description, validation rules, options
// (for enums), and schema_config (for nested objects).
//
// To create a node:
//
//   export const MyNode = createNode({
//     title: 'My Node',
//     fields: [
//       {
//         field: 'foo',
//         dataType: 'string',
//         label: 'Foo',
//         description: 'What foo does',
//         default: 'bar',
//         validations: [{ type: 'required', message: 'Foo is required' }],
//       },
//     ],
//     handles: [
//       { type: 'target', position: Position.Left,  id: 'in' },
//       { type: 'source', position: Position.Right, id: 'out' },
//     ],
//   });
//
// `config` may also be a function of ({ id, data }) when defaults need to
// derive from the node's id (e.g. auto-generated field names).

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Handle, useUpdateNodeInternals } from 'reactflow';
import { useStore } from '../store';
import { nodeClasses as c } from './nodeStyles';
import { fieldId, fieldDataType, isRequired, validateField } from './fieldSchema';
import { Dropdown } from './Dropdown';
import { NodeIcon } from './icons';

// --- Field value defaults --------------------------------------------------

const resolveDefault = (field, id, data) => {
  const key = fieldId(field);
  if (data?.[key] !== undefined) return data[key];
  if (typeof field.default === 'function') return field.default(id, data);
  if (field.default !== undefined) return field.default;

  const dataType = fieldDataType(field);
  if (dataType === 'boolean') return false;
  if (dataType === 'object') {
    const props = field.schema_config?.properties || {};
    return Object.fromEntries(
      Object.entries(props).map(([key, sub]) => [key, resolveDefault(sub, id, data)])
    );
  }
  return '';
};

const initValues = (fields, id, data) => {
  const values = {};
  for (const field of fields) values[fieldId(field)] = resolveDefault(field, id, data);
  return values;
};

// --- Auto-sizing textarea --------------------------------------------------
// Grows in height with the number of lines and in width with the longest
// line (clamped), so the Text node expands to fit what the user types.

const AutoSizeTextArea = ({ value, onChange, placeholder, invalid }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const longestLine = String(value)
    .split('\n')
    .reduce((max, line) => Math.max(max, line.length), 0);
  const widthCh = Math.min(60, Math.max(16, longestLine + 2));

  return (
    <textarea
      ref={ref}
      className={`${c.autoTextarea}${invalid ? ` ${c.inputError}` : ''}`}
      style={{ width: `${widthCh}ch` }}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// --- Field primitive (controlled, schema-driven) ---------------------------

const FieldLabel = ({ field }) =>
  field.label ? (
    <span className={c.label}>
      {field.label}
      {isRequired(field) && <span className={c.required}> *</span>}
    </span>
  ) : null;

const renderControl = (dataType, field, value, onChange, invalid) => {
  const inputCls = `${c.input}${invalid ? ` ${c.inputError}` : ''}`;
  switch (dataType) {
    case 'enum':
      return (
        <Dropdown value={value} options={field.options} onChange={onChange} invalid={invalid} />
      );
    case 'text':
      return field.autoSize ? (
        <AutoSizeTextArea value={value} onChange={onChange} placeholder={field.placeholder} invalid={invalid} />
      ) : (
        <textarea
          className={`${c.textarea}${invalid ? ` ${c.inputError}` : ''}`}
          rows={field.rows || 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return <input className={inputCls} type="number" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'string':
    default:
      return <input className={inputCls} type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
};

const NodeField = ({ field, value, onChange }) => {
  const dataType = fieldDataType(field);
  const error = validateField(field, value)[0];

  // Boolean → inline checkbox with its label to the right.
  if (dataType === 'boolean') {
    return (
      <div className={c.field}>
        <label className={c.checkboxRow}>
          <input
            className={c.checkbox}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className={c.checkboxLabel}>{field.checkboxLabel || field.label}</span>
        </label>
        {field.description && <span className={c.hint}>{field.description}</span>}
        {error && <span className={c.error}>{error}</span>}
      </div>
    );
  }

  // Object → a nested group of sub-fields defined in schema_config.properties.
  if (dataType === 'object') {
    const props = field.schema_config?.properties || {};
    const objectValue = value || {};
    return (
      <div className={c.field}>
        <FieldLabel field={field} />
        {field.description && <span className={c.hint}>{field.description}</span>}
        <div className={c.objectGroup}>
          {Object.entries(props).map(([key, subField]) => (
            <NodeField
              key={key}
              field={subField}
              value={objectValue[key]}
              onChange={(next) => onChange({ ...objectValue, [key]: next })}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={c.field}>
      <FieldLabel field={field} />
      {field.description && <span className={c.hint}>{field.description}</span>}
      {renderControl(dataType, field, value, onChange, !!error)}
      {error && <span className={c.error}>{error}</span>}
    </div>
  );
};

// --- Handle rendering ------------------------------------------------------
// Handles are grouped by side and evenly distributed along that edge, so a
// node with several inputs on the left automatically spaces them without any
// per-node math (this is what the original LLM node did by hand).

const isVertical = (position) => position === 'left' || position === 'right';

// Approximate header height, so vertically-distributed handles land inside the
// body and never collide with the title (important on short nodes like LLM).
const HEADER = '41px';

const renderHandles = (id, handles) => {
  const bySide = handles.reduce((acc, h) => {
    (acc[h.position] = acc[h.position] || []).push(h);
    return acc;
  }, {});

  return Object.entries(bySide).flatMap(([position, group]) =>
    group.map((h, i) => {
      const fraction = (i + 1) / (group.length + 1);
      // Vertical edges: distribute within the body (below the header).
      // Horizontal edges: distribute evenly across the full width.
      const offset = isVertical(position)
        ? `calc(${HEADER} + (100% - ${HEADER}) * ${fraction})`
        : `${fraction * 100}%`;
      const style = isVertical(position) ? { top: offset } : { left: offset };

      // Labels sit just outside the node edge, centered on their handle, so
      // they never overlap the node's own content (e.g. the Text textarea).
      const labelStyle = {};
      if (isVertical(position)) {
        labelStyle.top = `calc(${offset} - 8px)`;
        if (position === 'left') {
          labelStyle.right = 'calc(100% + 8px)';
          labelStyle.textAlign = 'right';
        } else {
          labelStyle.left = 'calc(100% + 8px)';
        }
      } else {
        labelStyle.left = `calc(${offset} - 20px)`;
        if (position === 'top') labelStyle.bottom = 'calc(100% + 6px)';
        else labelStyle.top = 'calc(100% + 6px)';
      }

      return (
        <div key={`${h.type}-${h.id}`}>
          <Handle type={h.type} position={position} id={`${id}-${h.id}`} className={c.handle} style={style} />
          {h.label && (
            <span className={c.handleLabel} style={labelStyle}>
              {h.label}
            </span>
          )}
        </div>
      );
    })
  );
};

// --- BaseNode --------------------------------------------------------------

export const BaseNode = ({ id, data, config }) => {
  const resolved = typeof config === 'function' ? config({ id, data }) : config;
  const { title, icon, fields = [], content, className = '' } = resolved;

  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeInternals = useUpdateNodeInternals();
  const [values, setValues] = useState(() => initValues(fields, id, data));

  const setValue = (name, next) => {
    setValues((prev) => ({ ...prev, [name]: next }));
    updateNodeField(id, name, next); // mirror into the store for persistence
  };

  // Handles may be derived from live field values (e.g. Text node variables).
  const handles =
    typeof resolved.handles === 'function'
      ? resolved.handles({ id, data, values })
      : resolved.handles || [];

  // React Flow caches handle positions; when the *set* of handles changes we
  // must tell it to recompute, or new edges won't connect to new handles.
  const handleSig = handles.map((h) => `${h.type}:${h.position}:${h.id}`).join('|');
  useEffect(() => {
    updateNodeInternals(id);
  }, [handleSig, id, updateNodeInternals]);

  return (
    <div className={`${c.container} ${className}`}>
      {renderHandles(id, handles)}

      <div className={c.header}>
        <span className={c.accentBar} />
        {icon && <NodeIcon name={icon} className="h-4 w-4 shrink-0" />}
        <span>{title}</span>
      </div>

      <div className={c.body}>
        {fields.map((field) => {
          const key = fieldId(field);
          return (
            <NodeField
              key={key}
              field={field}
              value={values[key]}
              onChange={(next) => setValue(key, next)}
            />
          );
        })}
        {typeof content === 'function' ? content({ id, data, values }) : content}
      </div>
    </div>
  );
};

// Factory: turn a config into a ready-to-register React component.
export const createNode = (config) => {
  const NodeComponent = ({ id, data }) => <BaseNode id={id} data={data} config={config} />;
  NodeComponent.displayName = 'Node';
  return NodeComponent;
};
