'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import type { Room, StyleBible } from '@/lib/types/database';
import type { ActionResult } from '../actions';

const idSchema = z.guid('Invalid id');
const optionalText = z
  .string()
  .trim()
  .max(80)
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(120, 'Room name is too long'),
  floor: optionalText,
  wing: optionalText,
});

const stringList = z.array(z.string().trim().min(1).max(200)).max(50).optional();
const styleBibleSchema = z.object({
  project_style: z.string().trim().max(200).optional(),
  inspirations: stringList,
  materials: stringList,
  mood: stringList,
  avoid: stringList,
});

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createRoom(
  projectId: string,
  input: { name: string; floor?: string | null; wing?: string | null }
): Promise<ActionResult<Room>> {
  const pid = idSchema.safeParse(projectId);
  if (!pid.success) return { ok: false, error: pid.error.issues[0].message };
  const parsed = createRoomSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('rooms')
    .insert({ project_id: pid.data, ...parsed.data })
    .select()
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Failed to create room' };

  revalidatePath(`/projects/${pid.data}`);
  return { ok: true, data };
}

export async function deleteRoom(roomId: string, projectId: string): Promise<ActionResult> {
  const parsed = z.object({ roomId: idSchema, projectId: idSchema }).safeParse({ roomId, projectId });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', parsed.data.roomId)
    .eq('project_id', parsed.data.projectId)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Room not found' };

  revalidatePath(`/projects/${parsed.data.projectId}`);
  return { ok: true };
}

export async function updateStyleBible(
  projectId: string,
  styleBible: StyleBible
): Promise<ActionResult<StyleBible>> {
  const pid = idSchema.safeParse(projectId);
  if (!pid.success) return { ok: false, error: pid.error.issues[0].message };
  const parsed = styleBibleSchema.safeParse(styleBible);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('projects')
    .update({ style_bible: parsed.data, updated_at: new Date().toISOString() })
    .eq('id', pid.data)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'Project not found' };

  revalidatePath(`/projects/${pid.data}`);
  revalidatePath('/projects');
  return { ok: true, data: parsed.data };
}
