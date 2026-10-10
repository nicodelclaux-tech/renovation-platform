'use client';

import { useMemo, useState } from 'react';
import { Generation } from '@/lib/types/database';
import { GenerationCard } from '@/components/generation/GenerationCard';
import { GenerateButton } from '@/components/generation/GenerateButton';
import { ComparisonView } from '@/components/generation/ComparisonView';
import { ImageIcon, Columns, Pin } from 'lucide-react';

const isComparable = (g: Generation) => !!g.image_url && (g.status === 'completed' || g.status === 'approved');

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

  // Newest first; the approved direction is pinned separately at the top.
  const { approved, history, comparable } = useMemo(() => {
    const sorted = [...generations].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const approvedGen = sorted.find((g) => g.status === 'approved') ?? null;
    return {
      approved: approvedGen,
      history: sorted.filter((g) => g.id !== approvedGen?.id),
      comparable: sorted.filter(isComparable),
    };
  }, [generations]);

  const handleSelect = (gen: Generation) => {
    if (!compareMode || !isComparable(gen)) return;
    setSelected((prev) =>
      prev.includes(gen.id) ? prev.filter((x) => x !== gen.id) : prev.length >= 2 ? [prev[1], gen.id] : [...prev, gen.id]
    );
  };

  const toggleCompare = () => {
    setCompareMode((v) => !v);
    setSelected([]);
  };

  const renderCard = (gen: Generation) => {
    const selectable = compareMode && isComparable(gen);
    return (
      <div
        key={gen.id}
        onClick={() => handleSelect(gen)}
        className={`rounded-lg ${selectable ? 'cursor-pointer' : ''} ${
          compareMode && !selectable ? 'opacity-50' : ''
        } ${selected.includes(gen.id) ? 'ring-2 ring-accent' : ''}`}
      >
        <GenerationCard generation={gen} roomId={roomId} projectId={projectId} />
      </div>
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
        <div className="flex items-start gap-sm">
          {comparable.length >= 2 && (
            <button
              onClick={toggleCompare}
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

      {compareMode && (
        <div className="mb-md p-sm bg-accent/5 border border-accent/20 rounded-md text-xs text-accent font-medium flex items-center gap-sm">
          {selected.length === 0 && 'Select two completed concepts to compare'}
          {selected.length > 0 && `${selected.length}/2 selected`}
          <button onClick={() => setShowComparison(true)} className="underline">
            {selected.length === 2 ? 'View comparison' : 'Open comparison'}
          </button>
        </div>
      )}

      {generations.length > 0 ? (
        <>
          {approved && (
            <div className="mb-lg">
              <p className="mb-sm flex items-center gap-xs text-xs font-medium uppercase tracking-wider text-accent">
                <Pin size={12} /> Approved direction
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">{renderCard(approved)}</div>
            </div>
          )}

          {history.length > 0 && (
            <>
              {approved && (
                <p className="mb-sm text-xs font-medium uppercase tracking-wider text-text-muted">History</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">{history.map(renderCard)}</div>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-md">
            <ImageIcon size={28} className="text-text-muted" />
          </div>
          <p className="text-text-dim text-base font-medium">No generations yet</p>
          <p className="text-text-muted text-sm mt-1">Fill in the room details and generate your first concept</p>
        </div>
      )}

      {showComparison && comparable.length >= 2 && (
        <ComparisonView
          generations={comparable}
          initialAId={selected[0]}
          initialBId={selected[1]}
          onClose={() => setShowComparison(false)}
        />
      )}
    </section>
  );
}
