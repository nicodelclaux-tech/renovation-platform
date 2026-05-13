'use client';

import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Generation } from '@/lib/types/database';

interface ComparisonViewProps {
  generationA: Generation;
  generationB: Generation;
  onClose: () => void;
}

export function ComparisonView({ generationA, generationB, onClose }: ComparisonViewProps) {
  const [sliderPos, setSliderPos] = useState(50);

  if (!generationA.image_url || !generationB.image_url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-neutral font-semibold">Compare Generations</h3>
          <button onClick={onClose} className="text-text-dim hover:text-neutral text-sm">Close ×</button>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border">
          {/* After Image (B) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${generationB.image_url})` }}
          />

          {/* Before Image (A) - clipped */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${generationA.image_url})`,
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            }}
          />

          {/* Slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-accent z-10 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/40">
              <ArrowLeftRight size={18} className="text-neutral" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-sm left-sm bg-primary/80 backdrop-blur-sm px-sm py-xs rounded-md text-xs text-neutral z-10">A</div>
          <div className="absolute bottom-sm right-sm bg-primary/80 backdrop-blur-sm px-sm py-xs rounded-md text-xs text-neutral z-10">B</div>
        </div>

        <div className="grid grid-cols-2 gap-md mt-md text-xs text-text-dim">
          <div>
            <span className="text-accent font-mono">A:</span> {generationA.prompt}
          </div>
          <div>
            <span className="text-accent font-mono">B:</span> {generationB.prompt}
          </div>
        </div>
      </div>
    </div>
  );
}
