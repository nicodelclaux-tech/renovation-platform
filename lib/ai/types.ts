import type { Generation } from '@/lib/types/database';

/** POST /api/generate-image request body. */
export type GenerateImageRequest = {
  roomId: string;
  projectId: string;
  /** Extra user direction folded into the architect prompt, e.g. "Make the scheme warmer". */
  instruction?: string;
  /** Refine this generation's image (images edit) instead of generating from scratch. */
  sourceGenerationId?: string;
};

export type GenerateImageResponse = { generation: Generation } | { error: string };

/** PATCH /api/generations/[id] request body. */
export type GenerationAction = 'approve' | 'unapprove';
export type UpdateGenerationRequest = { action: GenerationAction };
export type UpdateGenerationResponse = { generation: Generation } | { error: string };

/** Shape of generations.metadata written by the pipeline. */
export type GenerationMetadata = {
  model?: string;
  size?: string;
  mode?: 'generate' | 'edit';
  source_generation_id?: string;
  instruction?: string;
  storage_path?: string;
  error?: string;
};

export function readGenerationMetadata(metadata: unknown): GenerationMetadata {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? (metadata as GenerationMetadata)
    : {};
}
