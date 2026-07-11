import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className="flex h-screen flex-col bg-surface-muted">
      {/* Top bar */}
      <header className="flex items-center gap-3 bg-ink px-6 py-3 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold">
          V
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold">VectorShift</h1>
          <p className="text-xs text-white/50">Pipeline Builder</p>
        </div>
      </header>

      <PipelineToolbar />

      {/* Canvas grows to fill remaining space */}
      <main className="relative flex-1">
        <PipelineUI />
      </main>

      <SubmitButton />
    </div>
  );
}

export default App;
