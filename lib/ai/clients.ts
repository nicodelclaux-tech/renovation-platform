import OpenAI from 'openai';

/**
 * Lazily-constructed AI clients.
 *
 * Clients must never be created at module scope: `next build` evaluates route
 * modules while collecting page data, and the OpenAI SDK throws
 * "Missing credentials" when no API key is present in the build environment.
 */

export class MissingApiKeyError extends Error {
  constructor(public readonly envVar: string) {
    super(`${envVar} is not configured on the server`);
    this.name = 'MissingApiKeyError';
  }
}

let openaiClient: OpenAI | null = null;
let openrouterClient: OpenAI | null = null;

/** OpenAI client (gpt-image-1). Throws MissingApiKeyError if OPENAI_API_KEY is unset. */
export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError('OPENAI_API_KEY');
  if (!openaiClient) openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

/** OpenRouter client (Claude via the OpenAI-compatible API). Throws MissingApiKeyError if OPENROUTER_API_KEY is unset. */
export function getOpenRouter(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new MissingApiKeyError('OPENROUTER_API_KEY');
  if (!openrouterClient) {
    openrouterClient = new OpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });
  }
  return openrouterClient;
}

/** Model used for the "architect" prompt-crafting step. */
export const ARCHITECT_MODEL = process.env.OPENROUTER_ARCHITECT_MODEL || 'anthropic/claude-sonnet-4';

/** Image model + output settings. */
export const IMAGE_MODEL = 'gpt-image-1';
export const IMAGE_SIZE = '1536x1024' as const;
export const IMAGE_QUALITY = 'high' as const;
