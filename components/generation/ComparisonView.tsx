'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { Generation } from '@/lib/types/database';

interface ComparisonViewProps {
  /** Generations available for comparison (only those with an image are used). */
  generations: Generation[];
  initialAId?: string;
  initialBId?: string;
  onClose: () => void;
}

function label(gen: Generation, index: number) {
  const date = new Date(gen.created_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${gen.status === 'approved' ? '★ ' : ''}#${index + 1} · ${date} · ${gen.prompt.slice(0, 40)}`;
}

export function ComparisonView({ generations, initialAId, initialBId, onClose }: ComparisonViewProps) {
  const options = generations.filter((g) => !!g.image_url);
  const [aId, setAId] = useState(initialAId ?? options[0]?.id ?? '');
  const [bId, setBId] = useState(initialBId ?? options.find((g) => g.id !== aId)?.id ?? '');
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const generationA = options.find((g) => g.id === aId);
  const generationB = options.find((g) => g.id === bId);

  if (options.length < 2) return null;

  const selectClass =
    'w-full bg-white/10 border border-white/20 rounded-md px-sm py-1 text-xs text-white focus:outline-none focus:border-accent [&>option]:text-neutral';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare generations"
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-lg"
    >
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-white font-semibold">Compare Generations</h3>
          <button onClick={onClose} className="flex items-center gap-xs text-white/70 hover:text-white text-sm">
            Close <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-md mb-md">
          <label className="text-xs text-white/70 space-y-1">
            <span className="text-accent font-mono">A (left)</span>
            <select value={aId} onChange={(e) => setAId(e.target.value)} className={selectClass}>
              {options.map((g, i) => (
                <option key={g.id} value={g.id}>
                  {label(g, options.length - 1 - i)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/70 space-y-1">
            <span className="text-accent font-mono">B (right)</span>
            <select value={bId} onChange={(e) => setBId(e.target.value)} className={selectClass}>
              {options.map((g, i) => (
                <option key={g.id} value={g.id}>
                  {label(g, options.length - 1 - i)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {generationA?.image_url && generationB?.image_url ? (
          <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-white/10 select-none">
            {/* B — full background (right side) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${generationB.image_url})` }}
            />

            {/* A — clipped to the left of the slider */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${generationA.image_url})`,
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            />

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Comparison slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            <div
              className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/40">
                <ArrowLeftRight size={18} className="text-white" />
              </div>
            </div>

            <div className="absolute bottom-sm left-sm bg-black/60 backdrop-blur-sm px-sm py-xs rounded-md text-xs text-white z-10">A</div>
            <div className="absolute bottom-sm right-sm bg-black/60 backdrop-blur-sm px-sm py-xs rounded-md text-xs text-white z-10">B</div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-md mt-md text-xs text-white/70">
          <div className="line-clamp-3">
            <span className="text-accent font-mono">A:</span> {generationA?.prompt}
          </div>
          <div className="line-clamp-3">
            <span className="text-accent font-mono">B:</span> {generationB?.prompt}
          </div>
        </div>
      </div>
    </div>
  );
}
