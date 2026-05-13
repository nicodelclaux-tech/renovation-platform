'use client';

import { useState } from 'react';
import { Generation } from '@/lib/types/database';
import { GenerationCard } from '@/components/generation/GenerationCard';
import { GenerateButton } from '@/components/generation/GenerateButton';
import { ComparisonView } from '@/components/generation/ComparisonView';

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
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedGenerations = generations.filter((g) => selected.includes(g.id));

  // Auto-show comparison when 2 are selected
  const canCompare = selectedGenerations.length === 2;

  return (
    <section className="h-full overflow-y-auto p-lg">
      <div className="flex items-end justify-between mb-lg">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-dim">Generation Canvas</p>
          <h2 className="mt-xs text-xl font-semibold text-neutral">
            {generations.length} concept{generations.length !== 1 ? 's' : ''} generated
          </h2>
        </div>
        <div className="flex items-center gap-sm">
          {generations.length >= 2 && (
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelected([]);
                setShowComparison(false);
              }}
              className={`flex items-center gap-xs px-sm py-xs rounded-md text-sm transition-all ${
                compareMode ? 'bg-accent text-neutral' : 'bg-secondary border border-border text-text-dim hover:text-neutral'
              }`}
            >
              Compare
            </button>
          )}
          <GenerateButton roomId={roomId} projectId={projectId} />
        </div>
      </div>

      {compareMode && (
        <div className="mb-md flex items-center justify-between">
          <p className="text-xs text-text-dim">
            {selected.length === 0 && 'Select two generations to compare'}
            {selected.length === 1 && 'Select one more generation'}
            {selected.length === 2 && 'Ready to compare!'}
          </p>
          {canCompare && (
            <button
              onClick={() => setShowComparison(true)}
              className="px-sm py-xs rounded-md text-sm bg-accent text-neutral hover:bg-accent/90 transition-all"
            >
              View Comparison
            </button>
          )}
        </div>
      )}

      {generations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {generations.map((gen) => (
            <div
              key={gen.id}
              onClick={() => handleSelect(gen.id)}
              className={`${compareMode ? 'cursor-pointer' : ''} ${
                compareMode && selected.includes(gen.id)
                  ? 'ring-2 ring-accent rounded-xl'
                  : ''
              }`}
            >
              <GenerationCard generation={gen} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mb-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-dim">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <p className="text-text-dim text-lg">No generations yet</p>
          <p className="text-text-dim/60 text-sm mt-xs">Fill in the room details and generate your first concept</p>
        </div>
      )}

      {showComparison && canCompare && (
        <ComparisonView
          generationA={selectedGenerations[0]}
          generationB={selectedGenerations[1]}
          onClose={() => setShowComparison(false)}
        />
      )}
    </section>
  );
}
