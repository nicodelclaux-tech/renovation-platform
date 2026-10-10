/** Start of the marker the model appends when it wants a render: `[[GENERATE: <instruction>]]`. */
export const GENERATE_MARKER_PREFIX = '[[GENERATE:';

const MARKER_RE = /\[\[GENERATE:\s*([^\]\n]*?)\s*\]\]/;

/**
 * Split a raw model reply into the visible text (marker removed) and the
 * generation instruction, if any. Anything after the marker is dropped, since
 * the model is told the marker is its final line; an unterminated marker is
 * also dropped so it never reaches the user.
 */
export function extractGenerateIntent(raw: string): { text: string; instruction: string | null } {
  const start = raw.indexOf(GENERATE_MARKER_PREFIX);
  if (start === -1) return { text: raw.trim(), instruction: null };
  const match = MARKER_RE.exec(raw.slice(start));
  const instruction = match?.[1]?.trim() || null;
  return { text: raw.slice(0, start).trim(), instruction };
}
