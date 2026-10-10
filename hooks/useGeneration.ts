'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Generation } from '@/lib/types/database';
import type { GenerateImageRequest, GenerateImageResponse } from '@/lib/ai/types';

export type GenerateOptions = Pick<GenerateImageRequest, 'instruction' | 'sourceGenerationId'>;

/**
 * Triggers POST /api/generate-image for a room and refreshes the route on success.
 * `generate` resolves to the new generation, or null on failure (see `error`).
 */
export function useGeneration({ roomId, projectId }: { roomId: string; projectId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (opts: GenerateOptions = {}): Promise<Generation | null> => {
      setIsGenerating(true);
      setError(null);
      // Surface the in-progress ('generating') row shortly after the request starts.
      const progressRefresh = setTimeout(() => router.refresh(), 1500);
      try {
        const body: GenerateImageRequest = {
          roomId,
          projectId,
          ...(opts.instruction?.trim() ? { instruction: opts.instruction.trim() } : {}),
          ...(opts.sourceGenerationId ? { sourceGenerationId: opts.sourceGenerationId } : {}),
        };
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = (await res.json().catch(() => ({}))) as Partial<GenerateImageResponse>;

        if (!res.ok || !('generation' in data) || !data.generation) {
          setError(('error' in data && data.error) || `Generation failed (HTTP ${res.status})`);
          // A failed row may have been recorded — show it.
          router.refresh();
          return null;
        }

        router.refresh();
        return data.generation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
        return null;
      } finally {
        clearTimeout(progressRefresh);
        setIsGenerating(false);
      }
    },
    [roomId, projectId, router]
  );

  return { generate, isGenerating, error };
}
