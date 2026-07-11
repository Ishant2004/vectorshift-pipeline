// Unit tests for the zustand pipeline store.

import { useStore } from '../store';

const reset = () => useStore.setState({ nodes: [], edges: [], nodeIDs: {} });

beforeEach(reset);

describe('getNodeID', () => {
  it('generates incrementing ids per type', () => {
    const { getNodeID } = useStore.getState();
    expect(getNodeID('text')).toBe('text-1');
    expect(getNodeID('text')).toBe('text-2');
  });

  it('tracks counters independently per type', () => {
    const { getNodeID } = useStore.getState();
    expect(getNodeID('text')).toBe('text-1');
    expect(getNodeID('llm')).toBe('llm-1');
    expect(getNodeID('text')).toBe('text-2');
  });
});

describe('addNode', () => {
  it('appends a node to the list', () => {
    useStore.getState().addNode({ id: 'text-1', type: 'text' });
    expect(useStore.getState().nodes).toHaveLength(1);
    expect(useStore.getState().nodes[0].id).toBe('text-1');
  });
});

describe('onConnect', () => {
  it('adds a styled, animated edge', () => {
    useStore.getState().onConnect({
      source: 'a',
      target: 'b',
      sourceHandle: 'a-out',
      targetHandle: 'b-in',
    });
    const { edges } = useStore.getState();
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      type: 'smoothstep',
      animated: true,
    });
  });
});

describe('updateNodeField', () => {
  it('merges a field into the matching node data', () => {
    useStore.setState({
      nodes: [{ id: 'n1', data: { id: 'n1', foo: 'old' } }],
    });
    useStore.getState().updateNodeField('n1', 'foo', 'new');

    const node = useStore.getState().nodes.find((n) => n.id === 'n1');
    expect(node.data.foo).toBe('new');
    expect(node.data.id).toBe('n1'); // other data preserved
  });

  it('leaves other nodes untouched', () => {
    useStore.setState({
      nodes: [
        { id: 'n1', data: { id: 'n1', v: 1 } },
        { id: 'n2', data: { id: 'n2', v: 2 } },
      ],
    });
    useStore.getState().updateNodeField('n1', 'v', 99);

    const n2 = useStore.getState().nodes.find((n) => n.id === 'n2');
    expect(n2.data.v).toBe(2);
  });
});
