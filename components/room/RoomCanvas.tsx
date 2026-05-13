'use client';

import { useState } from 'react';
import { Generation } from '@/lib/types/database';
import { GenerationCard } from '@/components/generation/GenerationCard';
import { GenerateButton } from '@/components/generation/GenerateButton';
import { ComparisonView } from '@/components/generation/ComparisonView';
import { ImageIcon, Columns } from 'lucide-react';

export default function RoomCanvas({
  roomId,
  generations,
  projectId,
}: {
  roomId: string;
  generations: Generation[];
  projectId: string;
}) {
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelect = (id: string) => {
    if (!compareMode) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id]
    );
  };

  return (
    <section className="h-full overflow-y-auto p-lg bg-secondary">
      <div className="flex items-end justify-between mb-lg">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Generation Canvas</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral">
            {generations.length} concept{generations.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-sm">
          {generations.length >= 2 && (
            <button
              onClick={() => { setCompareMode(!compareMode); setSelected([]); }}
              className={`flex items-center gap-xs px-sm py-1.5 rounded-md text-xs font-medium transition-all ${
                compareMode ? 'bg-accent text-white' : 'border border-border text-text-dim hover:text-neutral hover:bg-secondary'
              }`}
            >
              <Columns size={14} /> Compare
            </button>
          )}
          <GenerateButton roomId={roomId} projectId={projectId} />
        </div>
      </div>

      {compareMode && selected.length > 0 && (
        <div className="mb-md p-sm bg-accent/5 border border-accent/20 rounded-md text-xs text-accent font-medium">
          {selected.length}/2 selected
          {selected.length === 2 && (
            <button onClick={() => setShowComparison(true)} className="ml-sm underline">View comparison</button>
          )}
        </div>
      )}

      {generations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {generations.map((gen) => (
            <div key={gen.id} onClick={() => handleSelect(gen.id)} className={`${
              compareMode ? 'cursor-pointer' : ''
            } ${selected.includes(gen.id) ? 'ring-2 ring-accent rounded-lg' : ''}`}>
              <GenerationCard generation={gen} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-md">
            <ImageIcon size={28} className="text-text-muted" />
          </div>
          <p className="text-text-dim text-base font-medium">No generations yet</p>
          <p className="text-text-muted text-sm mt-1">Fill in the room details and generate your first concept</p>
        </div>
      )}

      {showComparison && selected.length === 2 && (
        <ComparisonView
          generationA={generations.find((g) => g.id === selected[0])!}
          generationB={generations.find((g) => g.id === selected[1])!}
          onClose={() => setShowComparison(false)}
        />
      )}
    </section>
  );
}
