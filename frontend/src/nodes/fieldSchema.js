// fieldSchema.js
// --------------------------------------------------
// The canonical input-field schema shared by every node.
//
// A node's `fields` array is its *input schema*. Each field is described
// declaratively and BaseNode turns that description into a rendered, validated
// form control. The shape:
//
//   {
//     field:       'temperature',        // field identifier (unique per node)
//     dataType:    'number',             // string|text|number|boolean|enum|object
//     label:       'Temperature',        // display label
//     description: 'Sampling randomness',// helper text shown under the label
//     default:     0.7,                  // value, or (id, data) => value
//     options:     ['LOW','MEDIUM','HIGH'], // for dataType 'enum'
//     validations: [
//       { type: 'required', message: 'This field is required' },
//       { type: 'min', value: 0, message: 'Must be at least 0' },
//       { type: 'max', value: 2, message: 'Must be at most 2' },
//     ],
//     schema_config: {                   // for dataType 'object'
//       properties: {
//         token: { field: 'token', dataType: 'string', label: 'Token' },
//       },
//     },
//     autoSize: true,                    // for dataType 'text'
//   }
//
// Supported validation rule types: required | minLength | maxLength | min |
// max | pattern. `value` carries the rule's parameter; `message` is optional
// (a sensible default is generated when omitted).

/**
 * @typedef {Object} Validation
 * @property {'required'|'minLength'|'maxLength'|'min'|'max'|'pattern'} type
 * @property {number|string} [value]
 * @property {string} [message]
 */

/**
 * @typedef {Object} Field
 * @property {string} field              Field identifier (alias: `name`).
 * @property {'string'|'text'|'number'|'boolean'|'enum'|'object'} dataType
 * @property {string} [label]
 * @property {string} [description]
 * @property {*} [default]
 * @property {(string|{value:string,label:string})[]} [options]
 * @property {Validation[]} [validations]
 * @property {{ properties: Object<string, Field> }} [schema_config]
 * @property {boolean} [autoSize]
 */

// Maps the legacy `type` key to a `dataType`, so older field definitions keep
// working without change.
const LEGACY_TYPE = {
  text: 'string',
  select: 'enum',
  textarea: 'text',
  number: 'number',
  checkbox: 'boolean',
};

export const fieldId = (field) => field.field ?? field.name;

export const fieldDataType = (field) =>
  field.dataType || LEGACY_TYPE[field.type] || 'string';

export const isRequired = (field) =>
  (field.validations || []).some((rule) => rule.type === 'required');

const isEmpty = (value) => value === undefined || value === null || value === '';

// One function per rule type: returns true when the value PASSES the rule.
const RULES = {
  required: (value) => !(isEmpty(value) || value === false),
  minLength: (value, n) => String(value ?? '').length >= n,
  maxLength: (value, n) => String(value ?? '').length <= n,
  min: (value, n) => Number(value) >= n,
  max: (value, n) => Number(value) <= n,
  pattern: (value, p) => new RegExp(p).test(String(value ?? '')),
};

const DEFAULT_MESSAGE = {
  required: () => 'This field is required',
  minLength: (n) => `Minimum length is ${n} characters`,
  maxLength: (n) => `Maximum length is ${n} characters`,
  min: (n) => `Must be at least ${n}`,
  max: (n) => `Must be at most ${n}`,
  pattern: () => 'Invalid format',
};

/**
 * Validate a value against a field's rules.
 * @returns {string[]} human-readable error messages (empty when valid).
 */
export const validateField = (field, value) => {
  const errors = [];
  for (const rule of field.validations || []) {
    // Non-required rules don't fire on an empty value — only `required` does.
    if (rule.type !== 'required' && isEmpty(value)) continue;

    const check = RULES[rule.type];
    if (!check) continue;

    if (!check(value, rule.value)) {
      errors.push(
        rule.message || DEFAULT_MESSAGE[rule.type]?.(rule.value) || 'Invalid value'
      );
    }
  }
  return errors;
};
