// Unit tests for the Text node's {{ variable }} extraction.

import { extractVariables } from '../textNode';

describe('extractVariables', () => {
  it('returns an empty array when there are no variables', () => {
    expect(extractVariables('just some text')).toEqual([]);
  });

  it('extracts a single variable', () => {
    expect(extractVariables('{{input}}')).toEqual(['input']);
  });

  it('allows surrounding whitespace inside the braces', () => {
    expect(extractVariables('{{  input  }}')).toEqual(['input']);
  });

  it('extracts multiple variables in order', () => {
    expect(extractVariables('Hi {{ first }} and {{ second }}')).toEqual([
      'first',
      'second',
    ]);
  });

  it('deduplicates repeated variables', () => {
    expect(extractVariables('{{ x }} then {{ x }} again')).toEqual(['x']);
  });

  it('ignores invalid identifiers (leading digit, hyphen)', () => {
    expect(extractVariables('{{ 1bad }} and {{ a-b }}')).toEqual([]);
  });

  it('accepts identifiers with $ and _', () => {
    expect(extractVariables('{{ _priv }} {{ $ref }} {{ a1 }}')).toEqual([
      '_priv',
      '$ref',
      'a1',
    ]);
  });

  it('handles multi-line text', () => {
    expect(extractVariables('{{ a }}\nmiddle\n{{ b }}')).toEqual(['a', 'b']);
  });

  it('is safe on empty / undefined input', () => {
    expect(extractVariables('')).toEqual([]);
    expect(extractVariables()).toEqual([]);
  });
});
