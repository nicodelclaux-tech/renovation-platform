import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  ASSETS_BUCKET,
  MAX_ASSET_BYTES,
  isAllowedMimeType,
  roomIdSchema,
  safeFileName,
  uploadFieldsSchema,
  withSignedUrls,
} from './shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = roomIdSchema.safeParse(req.nextUrl.searchParams.get('roomId'));
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid roomId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('room_assets')
    .select('*')
    .eq('room_id', parsed.data)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const assets = await withSignedUrls(supabase, data ?? []);
  return NextResponse.json({ assets });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  const fields = uploadFieldsSchema.safeParse({
    roomId: form.get('roomId'),
    kind: form.get('kind'),
    notes: form.get('notes') ?? undefined,
  });
  if (!fields.success) {
    return NextResponse.json(
      { error: 'Invalid fields', issues: fields.error.issues },
      { status: 400 }
    );
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'A non-empty file is required' }, { status: 400 });
  }
  if (file.size > MAX_ASSET_BYTES) {
    return NextResponse.json({ error: 'File exceeds the 15 MB limit' }, { status: 413 });
  }
  if (!isAllowedMimeType(file.type)) {
    return NextResponse.json(
      { error: 'Only images and PDF files are allowed' },
      { status: 415 }
    );
  }

  const { roomId, kind, notes } = fields.data;

  // RLS only returns the room if it belongs to one of the user's projects.
  const { data: room } = await supabase.from('rooms').select('id').eq('id', roomId).maybeSingle();
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const storagePath = `${user.id}/${roomId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: asset, error: insertError } = await supabase
    .from('room_assets')
    .insert({
      room_id: roomId,
      kind,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      notes,
    })
    .select()
    .single();

  if (insertError || !asset) {
    // Don't leave an orphaned object behind.
    await supabase.storage.from(ASSETS_BUCKET).remove([storagePath]);
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to save asset' },
      { status: 500 }
    );
  }

  const [withUrl] = await withSignedUrls(supabase, [asset]);
  return NextResponse.json({ asset: withUrl }, { status: 201 });
}
