// Integration test for the Submit button: it should POST the pipeline and
// show the parsed result in a modal. `fetch` is mocked.

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmitButton } from '../submit';
import { useStore } from '../store';

const clickSubmit = () =>
  fireEvent.click(screen.getByRole('button', { name: /submit pipeline/i }));

const mockFetch = (body) => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => body });
};

beforeEach(() => {
  useStore.setState({
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [{ id: 'e1', source: 'a', target: 'b' }],
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('SubmitButton', () => {
  it('posts the nodes and edges to the parse endpoint', async () => {
    mockFetch({ num_nodes: 3, num_edges: 1, is_dag: true });

    render(<SubmitButton />);
    clickSubmit();

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/pipelines/parse');
    expect(options.method).toBe('POST');
    const bodyData = JSON.parse(options.body);
    expect(bodyData.nodes).toHaveLength(3);
    expect(bodyData.edges).toHaveLength(1);
  });

  it('shows the parsed counts and a valid-DAG badge in a modal', async () => {
    mockFetch({ num_nodes: 3, num_edges: 1, is_dag: true });

    render(<SubmitButton />);
    clickSubmit();

    expect(await screen.findByText('Pipeline analysis')).toBeInTheDocument();
    expect(screen.getByText('Nodes')).toBeInTheDocument();
    expect(screen.getByText('Edges')).toBeInTheDocument();
    expect(screen.getByText('Valid DAG')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('reports when the pipeline is not a DAG', async () => {
    mockFetch({ num_nodes: 2, num_edges: 2, is_dag: false });

    render(<SubmitButton />);
    clickSubmit();

    expect(await screen.findByText('No')).toBeInTheDocument();
    expect(screen.getByText(/contains a cycle/i)).toBeInTheDocument();
  });

  it('shows a friendly error modal when the backend is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<SubmitButton />);
    clickSubmit();

    expect(await screen.findByText(/couldn't reach the backend/i)).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('closes the modal when the action button is clicked', async () => {
    mockFetch({ num_nodes: 1, num_edges: 0, is_dag: true });

    render(<SubmitButton />);
    clickSubmit();

    const doneButton = await screen.findByRole('button', { name: /done/i });
    fireEvent.click(doneButton);

    await waitFor(() =>
      expect(screen.queryByText('Pipeline analysis')).not.toBeInTheDocument()
    );
  });
});
