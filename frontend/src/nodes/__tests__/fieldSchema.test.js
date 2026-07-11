// Unit tests for the field-schema helpers and validation engine.

import {
  fieldId,
  fieldDataType,
  isRequired,
  validateField,
} from '../fieldSchema';

describe('fieldId', () => {
  it('prefers the `field` identifier', () => {
    expect(fieldId({ field: 'foo', name: 'bar' })).toBe('foo');
  });

  it('falls back to the legacy `name` key', () => {
    expect(fieldId({ name: 'bar' })).toBe('bar');
  });
});

describe('fieldDataType', () => {
  it('returns an explicit dataType', () => {
    expect(fieldDataType({ dataType: 'number' })).toBe('number');
  });

  it('maps legacy `type` values to a dataType', () => {
    expect(fieldDataType({ type: 'text' })).toBe('string');
    expect(fieldDataType({ type: 'select' })).toBe('enum');
    expect(fieldDataType({ type: 'textarea' })).toBe('text');
    expect(fieldDataType({ type: 'checkbox' })).toBe('boolean');
    expect(fieldDataType({ type: 'number' })).toBe('number');
  });

  it('defaults to string when nothing is specified', () => {
    expect(fieldDataType({})).toBe('string');
  });
});

describe('isRequired', () => {
  it('is true when a required rule is present', () => {
    expect(isRequired({ validations: [{ type: 'required' }] })).toBe(true);
  });

  it('is false without a required rule', () => {
    expect(isRequired({ validations: [{ type: 'minLength', value: 2 }] })).toBe(false);
    expect(isRequired({})).toBe(false);
  });
});

describe('validateField', () => {
  it('returns no errors when there are no validations', () => {
    expect(validateField({}, 'anything')).toEqual([]);
  });

  describe('required', () => {
    const field = { validations: [{ type: 'required', message: 'Required!' }] };

    it('fails on empty string', () => {
      expect(validateField(field, '')).toEqual(['Required!']);
    });

    it('fails on undefined', () => {
      expect(validateField(field, undefined)).toEqual(['Required!']);
    });

    it('fails on unchecked boolean (false)', () => {
      expect(validateField(field, false)).toEqual(['Required!']);
    });

    it('passes on a non-empty value', () => {
      expect(validateField(field, 'x')).toEqual([]);
    });

    it('generates a default message when none is given', () => {
      expect(validateField({ validations: [{ type: 'required' }] }, '')).toEqual([
        'This field is required',
      ]);
    });
  });

  describe('minLength / maxLength', () => {
    it('enforces minLength', () => {
      const field = { validations: [{ type: 'minLength', value: 3 }] };
      expect(validateField(field, 'ab')).toEqual(['Minimum length is 3 characters']);
      expect(validateField(field, 'abc')).toEqual([]);
    });

    it('enforces maxLength', () => {
      const field = { validations: [{ type: 'maxLength', value: 3 }] };
      expect(validateField(field, 'abcd')).toEqual(['Maximum length is 3 characters']);
      expect(validateField(field, 'abc')).toEqual([]);
    });

    it('does not fire on an empty value when not required', () => {
      const field = { validations: [{ type: 'minLength', value: 3 }] };
      expect(validateField(field, '')).toEqual([]);
    });
  });

  describe('min / max', () => {
    it('enforces min', () => {
      const field = { validations: [{ type: 'min', value: 0 }] };
      expect(validateField(field, -1)).toEqual(['Must be at least 0']);
      expect(validateField(field, 0)).toEqual([]);
    });

    it('enforces max', () => {
      const field = { validations: [{ type: 'max', value: 2 }] };
      expect(validateField(field, 3)).toEqual(['Must be at most 2']);
      expect(validateField(field, 2)).toEqual([]);
    });
  });

  describe('pattern', () => {
    const field = {
      validations: [
        { type: 'pattern', value: '^[A-Za-z_$][A-Za-z0-9_$]*$', message: 'Bad name' },
      ],
    };

    it('rejects an invalid identifier', () => {
      expect(validateField(field, '1abc')).toEqual(['Bad name']);
      expect(validateField(field, 'a-b')).toEqual(['Bad name']);
    });

    it('accepts a valid identifier', () => {
      expect(validateField(field, 'myVar_1')).toEqual([]);
    });
  });

  it('collects multiple errors in order', () => {
    const field = {
      validations: [
        { type: 'required', message: 'Required!' },
        { type: 'minLength', value: 3, message: 'Too short' },
      ],
    };
    // Empty only triggers required (non-required rules skip empty values).
    expect(validateField(field, '')).toEqual(['Required!']);
    // Short-but-present triggers minLength.
    expect(validateField(field, 'ab')).toEqual(['Too short']);
  });
});
