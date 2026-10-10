import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ASSETS_BUCKET } from '../shared';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid asset id' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RLS scopes this to assets in the user's own rooms.
  const { data: asset } = await supabase
    .from('room_assets')
    .select('id, storage_path')
    .eq('id', id)
    .maybeSingle();
  if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

  const { error: storageError } = await supabase.storage
    .from(ASSETS_BUCKET)
    .remove([asset.storage_path]);
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from('room_assets').delete().eq('id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
