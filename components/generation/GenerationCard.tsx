'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle, Clock, Pin, Trash2, Wand2, RotateCcw, X } from 'lucide-react';
import { Generation } from '@/lib/types/database';
import { useGeneration } from '@/hooks/useGeneration';
import { readGenerationMetadata, type GenerationAction } from '@/lib/ai/types';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending' },
  generating: { icon: Loader2, color: 'text-blue-600 bg-blue-50', label: 'Generating' },
  completed: { icon: Check, color: 'text-green-600 bg-green-50', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Failed' },
  approved: { icon: Pin, color: 'text-accent bg-accent/8', label: 'Approved' },
};

export function GenerationCard({
  generation,
  roomId,
  projectId,
}: {
  generation: Generation;
  roomId: string;
  projectId: string;
}) {
  const router = useRouter();
  const { generate, isGenerating, error: generateError } = useGeneration({ roomId, projectId });
  const [busy, setBusy] = useState<GenerationAction | 'delete' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState(false);
  const [instruction, setInstruction] = useState('');

  const { status } = generation;
  const metadata = readGenerationMetadata(generation.metadata);
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const hasImage = !!generation.image_url;
  const error = actionError || generateError;

  const updateStatus = async (action: GenerationAction) => {
    setBusy(action);
    setActionError(null);
    try {
      const res = await fetch(`/api/generations/${generation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (HTTP ${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this generation? This cannot be undone.')) return;
    setBusy('delete');
    setActionError(null);
    try {
      const res = await fetch(`/api/generations/${generation.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (HTTP ${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    const result = await generate({ instruction, sourceGenerationId: generation.id });
    if (result) {
      setInstruction('');
      setRefineOpen(false);
    }
  };

  const handleRetry = () =>
    generate({ instruction: metadata.instruction, sourceGenerationId: metadata.source_generation_id });

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const actionClass =
    'flex items-center gap-xs text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <article
      className={`bg-surface border rounded-lg overflow-hidden group hover:shadow-[var(--shadow-card)] transition-all ${
        status === 'approved' ? 'border-accent ring-1 ring-accent/30' : 'border-border'
      }`}
    >
      {hasImage ? (
        <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
          <img
            src={generation.image_url!}
            alt={generation.prompt}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs gap-xs">
              <Loader2 size={16} className="animate-spin" /> Refining…
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[4/3] bg-secondary flex flex-col items-center justify-center gap-sm p-md text-center">
          {status === 'generating' || status === 'pending' || isGenerating ? (
            <Loader2 size={24} className="text-accent animate-spin" />
          ) : status === 'failed' ? (
            <>
              <AlertCircle size={24} className="text-red-500" />
              <p className="text-xs text-red-600 line-clamp-3" title={metadata.error}>
                {metadata.error || 'Generation failed'}
              </p>
            </>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary border border-border" />
          )}
        </div>
      )}

      <div className="p-sm">
        <div className="flex items-center justify-between gap-xs">
          <p className="text-xs text-text-dim line-clamp-1 flex-1" title={generation.prompt}>
            {generation.prompt}
          </p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${config.color}`}>
            <StatusIcon size={10} className={status === 'generating' ? 'animate-spin' : ''} />
            {config.label}
          </span>
        </div>

        {metadata.source_generation_id && (
          <p className="mt-1 text-[10px] text-text-muted">Refined from an earlier concept</p>
        )}

        <div className="mt-sm flex flex-wrap items-center gap-md" onClick={stop}>
          {status === 'completed' && (
            <button
              onClick={() => updateStatus('approve')}
              disabled={!!busy}
              className={`${actionClass} text-accent hover:text-accent-hover`}
            >
              {busy === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
            </button>
          )}
          {status === 'approved' && (
            <button
              onClick={() => updateStatus('unapprove')}
              disabled={!!busy}
              className={`${actionClass} text-text-dim hover:text-neutral`}
            >
              {busy === 'unapprove' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Unapprove
            </button>
          )}
          {hasImage && (status === 'completed' || status === 'approved') && (
            <button
              onClick={() => setRefineOpen((v) => !v)}
              disabled={isGenerating}
              className={`${actionClass} text-text-dim hover:text-neutral`}
            >
              <Wand2 size={12} /> Refine
            </button>
          )}
          {status === 'failed' && (
            <button onClick={handleRetry} disabled={isGenerating} className={`${actionClass} text-accent hover:text-accent-hover`}>
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Retry
            </button>
          )}
          {status !== 'generating' && (
            <button
              onClick={handleDelete}
              disabled={!!busy || isGenerating}
              className={`${actionClass} ml-auto text-text-muted hover:text-red-600`}
              aria-label="Delete generation"
            >
              {busy === 'delete' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          )}
        </div>

        {refineOpen && (
          <form onSubmit={handleRefine} onClick={stop} className="mt-sm flex items-center gap-xs">
            <input
              autoFocus
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Make the scheme warmer"
              maxLength={2000}
              disabled={isGenerating}
              className="flex-1 min-w-0 bg-primary border border-border rounded-md px-sm py-1 text-xs text-neutral placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={isGenerating || !instruction.trim()}
              className="flex items-center gap-xs bg-accent text-white px-sm py-1 rounded-md text-xs font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
              {isGenerating ? 'Refining…' : 'Refine'}
            </button>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-xs text-[11px] text-red-600 line-clamp-2" title={error}>
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
