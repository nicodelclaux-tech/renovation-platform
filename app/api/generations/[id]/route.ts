import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthContext, getOwnedGeneration, getStorageClient } from '@/lib/ai/route-auth';
import { readGenerationMetadata } from '@/lib/ai/types';

const RENDERS_BUCKET = 'renders';

// Contract: see UpdateGenerationRequest in lib/ai/types.ts
const patchSchema = z.object({
  action: z.enum(['approve', 'unapprove']),
});

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/generations/[id] — approve / unapprove a generation (one approved per room). */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request: action must be 'approve' or 'unapprove'" }, { status: 400 });
  }

  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, db } = auth;

  const generation = await getOwnedGeneration(db, user.id, id);
  if (!generation) return NextResponse.json({ error: 'Generation not found' }, { status: 404 });

  if (parsed.data.action === 'approve') {
    if (generation.status !== 'completed' && generation.status !== 'approved') {
      return NextResponse.json({ error: 'Only completed generations can be approved' }, { status: 409 });
    }

    // Only one approved direction per room: demote the current one(s).
    const { error: demoteError } = await db
      .from('generations')
      .update({ status: 'completed' })
      .eq('room_id', generation.room_id)
      .eq('status', 'approved')
      .neq('id', generation.id);
    if (demoteError) {
      return NextResponse.json({ error: `Failed to update generations: ${demoteError.message}` }, { status: 500 });
    }

    const { data: updated, error } = await db
      .from('generations')
      .update({ status: 'approved' })
      .eq('id', generation.id)
      .select()
      .single();
    if (!updated) return NextResponse.json({ error: error?.message || 'Failed to approve' }, { status: 500 });
    return NextResponse.json({ generation: updated });
  }

  // unapprove
  if (generation.status !== 'approved') {
    return NextResponse.json({ generation });
  }
  const { data: updated, error } = await db
    .from('generations')
    .update({ status: 'completed' })
    .eq('id', generation.id)
    .select()
    .single();
  if (!updated) return NextResponse.json({ error: error?.message || 'Failed to unapprove' }, { status: 500 });
  return NextResponse.json({ generation: updated });
}

/** DELETE /api/generations/[id] — delete a generation and its stored render. */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, db } = auth;

  const generation = await getOwnedGeneration(db, user.id, id);
  if (!generation) return NextResponse.json({ error: 'Generation not found' }, { status: 404 });

  const { data: deleted, error } = await db.from('generations').delete().eq('id', generation.id).select('id');
  if (error) return NextResponse.json({ error: `Failed to delete: ${error.message}` }, { status: 500 });
  if (!deleted?.length) {
    // RLS silently filtered the delete.
    return NextResponse.json({ error: 'Not allowed to delete this generation' }, { status: 403 });
  }

  // Best-effort storage cleanup (legacy renders were stored as `<id>.png` at the bucket root).
  const storagePath = readGenerationMetadata(generation.metadata).storage_path || `${generation.id}.png`;
  const { error: storageError } = await getStorageClient(db).storage.from(RENDERS_BUCKET).remove([storagePath]);
  if (storageError) console.warn('Failed to remove render from storage:', storageError.message);

  return NextResponse.json({ success: true });
}
