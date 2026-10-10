'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { useGeneration } from '@/hooks/useGeneration';

export function GenerateButton({ roomId, projectId }: { roomId: string; projectId: string }) {
  const { generate, isGenerating, error } = useGeneration({ roomId, projectId });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => generate()}
        disabled={isGenerating}
        className="flex items-center gap-xs bg-accent text-white px-md py-1.5 rounded-md font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
      {error && (
        <p role="alert" className="max-w-[260px] text-right text-[11px] text-red-600 line-clamp-2" title={error}>
          {error}
        </p>
      )}
    </div>
  );
}
