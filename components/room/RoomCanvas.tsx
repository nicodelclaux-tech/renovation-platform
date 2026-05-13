'use client';

import { Generation } from '@/lib/types/database';
import { GenerationCard } from '@/components/generation/GenerationCard';
import { GenerateButton } from '@/components/generation/GenerateButton';

export default function RoomCanvas({
  roomId,
  generations,
  projectId,
}: {
  roomId: string;
  generations: Generation[];
  projectId: string;
}) {
  return (
    <section className="h-full overflow-y-auto p-lg">
      <div className="flex items-end justify-between mb-lg">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-dim">Generation Canvas</p>
          <h2 className="mt-xs text-xl font-semibold text-neutral">
            {generations.length} concept{generations.length !== 1 ? 's' : ''} generated
          </h2>
        </div>
        <GenerateButton roomId={roomId} projectId={projectId} />
      </div>

      {generations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {generations.map((gen) => (
            <GenerationCard key={gen.id} generation={gen} />
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
    </section>
  );
}
