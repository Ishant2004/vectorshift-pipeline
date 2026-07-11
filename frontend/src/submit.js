// submit.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const API_URL = 'http://localhost:8000/pipelines/parse';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [submitting, setSubmitting] = useState(false);

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

      alert(
        'Pipeline submitted successfully! 🎉\n\n' +
        `• Nodes: ${num_nodes}\n` +
        `• Edges: ${num_edges}\n` +
        `• Valid DAG: ${is_dag ? 'Yes ✅' : 'No ❌'}\n\n` +
        (is_dag
          ? 'Your pipeline is a valid directed acyclic graph.'
          : 'Heads up: your pipeline contains a cycle, so it is not a DAG.')
      );
    } catch (error) {
      alert(
        'Could not reach the backend. 😕\n\n' +
        `${error.message}\n\n` +
        'Make sure the FastAPI server is running on http://localhost:8000.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
  );
};
