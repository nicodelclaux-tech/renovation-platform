/**
 * Sanitise a post-auth redirect target. Only same-origin relative paths
 * (e.g. "/projects/123?tab=rooms") are allowed; absolute URLs and
 * protocol-relative URLs ("//evil.com", "/\\evil.com") fall back.
 */
export const safeRedirectPath = (value: string | null | undefined, fallback = '/projects') => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
};
