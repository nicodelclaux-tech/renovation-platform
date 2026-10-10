import { z } from 'zod';
import type { RoomAsset } from '@/lib/types/database';
import type { createClient } from '@/utils/supabase/server';

export const ASSETS_BUCKET = 'assets';
export const MAX_ASSET_BYTES = 15 * 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 60 * 60;
export const ASSET_KINDS = ['photo', 'floor_plan', 'reference', 'other'] as const;

export type ServerSupabase = Awaited<ReturnType<typeof createClient>>;
export type RoomAssetWithUrl = RoomAsset & { signedUrl: string | null };

export const uploadFieldsSchema = z.object({
  roomId: z.uuid(),
  kind: z.enum(ASSET_KINDS),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const roomIdSchema = z.uuid();

export function isAllowedMimeType(type: string) {
  return type.startsWith('image/') || type === 'application/pdf';
}

/** Keep filenames path-safe: strip directories, collapse odd characters, cap length. */
export function safeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() || 'file';
  const cleaned = base
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  return (cleaned || 'file').slice(-100);
}

export async function withSignedUrls(
  supabase: ServerSupabase,
  assets: RoomAsset[]
): Promise<RoomAssetWithUrl[]> {
  if (assets.length === 0) return [];
  const { data } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrls(
      assets.map((a) => a.storage_path),
      SIGNED_URL_TTL_SECONDS
    );
  const byPath = new Map<string, string>();
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl && !entry.error) byPath.set(entry.path, entry.signedUrl);
  }
  return assets.map((a) => ({ ...a, signedUrl: byPath.get(a.storage_path) ?? null }));
}
