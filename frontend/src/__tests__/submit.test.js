// Integration test for the Submit button: it should POST the pipeline and
// alert the parsed result. `fetch` and `alert` are mocked.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from '../submit';
import { useStore } from '../store';

const seedPipeline = () =>
  useStore.setState({
    nodes: [{ id: 'a' }, { id: 'b' }],
    edges: [{ id: 'e1', source: 'a', target: 'b' }],
  });

beforeEach(() => {
  seedPipeline();
  window.alert = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('SubmitButton', () => {
  it('posts the nodes and edges to the parse endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ num_nodes: 2, num_edges: 1, is_dag: true }),
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://localhost:8000/pipelines/parse');
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.nodes).toHaveLength(2);
    expect(body.edges).toHaveLength(1);
  });

  it('alerts the parsed node/edge counts and DAG result', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ num_nodes: 2, num_edges: 1, is_dag: true }),
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    const message = window.alert.mock.calls[0][0];
    expect(message).toContain('Nodes: 2');
    expect(message).toContain('Edges: 1');
    expect(message).toContain('Yes');
  });

  it('reports when the pipeline is not a DAG', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ num_nodes: 2, num_edges: 2, is_dag: false }),
    });

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(window.alert.mock.calls[0][0]).toContain('No');
  });

  it('shows a friendly error when the backend is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<SubmitButton />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(window.alert.mock.calls[0][0]).toContain('Could not reach the backend');
  });
});
