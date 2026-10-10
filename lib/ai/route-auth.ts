import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/utils/supabase/server';
import { createServerClient } from '@/lib/supabase-server';
import type { Database } from '@/lib/types/database';

type DB = SupabaseClient<Database>;

export type AuthContext = {
  user: User;
  /** Cookie-based session client — used for every user-scoped query/update (RLS applies). */
  db: DB;
};

/**
 * Resolve the signed-in user from the request cookies.
 * Returns null when there is no authenticated user.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const sessionClient: DB = await createSessionClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return null;

  return { user, db: sessionClient };
}

/**
 * Client for Storage operations on the 'renders' bucket.
 * Uses the service-role client when configured (storage policies may not grant
 * authenticated users write access), else the session client.
 * ONLY call this after ownership has been verified with the session client.
 */
export function getStorageClient(sessionDb: DB): DB {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ? createServerClient() : sessionDb;
}

/** True when the project exists and belongs to the user. */
export async function userOwnsProject(db: DB, userId: string, projectId: string): Promise<boolean> {
  const { data: project } = await db
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .maybeSingle();
  return !!project && project.user_id === userId;
}

/**
 * Load a generation if it belongs (via room → project) to the user.
 * Returns null when it does not exist or is not owned by the user.
 */
export async function getOwnedGeneration(db: DB, userId: string, generationId: string) {
  const { data: generation } = await db.from('generations').select('*').eq('id', generationId).maybeSingle();
  if (!generation) return null;

  const { data: room } = await db.from('rooms').select('id, project_id').eq('id', generation.room_id).maybeSingle();
  if (!room) return null;

  return (await userOwnsProject(db, userId, room.project_id)) ? generation : null;
}
