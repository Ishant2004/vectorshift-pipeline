// submit.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { Modal } from './Modal';

// Backend base URL comes from the environment (REACT_APP_API_URL).
// Local dev falls back to localhost; on Vercel this is set to the Railway URL.
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/pipelines/parse`;

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

const Stat = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
    <span className="text-sm text-ink-soft">{label}</span>
    <span className="text-sm font-semibold text-ink">{value}</span>
  </div>
);

const ResultContent = ({ result, onClose }) => {
  if (result.status === 'error') {
    return (
      <>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">
            ⚠️
          </div>
          <h2 className="text-lg font-semibold text-ink">Couldn't reach the backend</h2>
        </div>
        <p className="mb-1 text-sm text-ink-soft">{result.message}</p>
        <p className="mb-5 text-xs text-ink-faint">
          Check that the backend is running and its CORS settings allow this site.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Dismiss
        </button>
      </>
    );
  }

  const { num_nodes, num_edges, is_dag } = result;
  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-xl">
          🧩
        </div>
        <h2 className="text-lg font-semibold text-ink">Pipeline analysis</h2>
      </div>

      <div className="mb-4 space-y-2">
        <Stat label="Nodes" value={num_nodes} />
        <Stat label="Edges" value={num_edges} />
        <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
          <span className="text-sm text-ink-soft">Valid DAG</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              is_dag ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {is_dag ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <p className="mb-5 text-sm text-ink-soft">
        {is_dag
          ? 'Your pipeline is a valid directed acyclic graph.'
          : 'Heads up: your pipeline contains a cycle, so it is not a DAG.'}
      </p>

      <button
        onClick={onClose}
        className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Done
      </button>
    </>
  );
};

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const { num_nodes, num_edges, is_dag } = await response.json();
      setResult({ status: 'success', num_nodes, num_edges, is_dag });
    } catch (error) {
      setResult({ status: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center border-t border-surface-border bg-surface px-6 py-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold
                     text-white shadow-sm transition hover:bg-brand-700
                     focus:outline-none focus:ring-2 focus:ring-brand-400
                     focus:ring-offset-2 active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Pipeline'}
        </button>
      </div>

      {result && (
        <Modal onClose={() => setResult(null)}>
          <ResultContent result={result} onClose={() => setResult(null)} />
        </Modal>
      )}
    </>
  );
};
