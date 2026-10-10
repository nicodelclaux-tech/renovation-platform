'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import type { Room } from '@/lib/types/database';
import type { ActionResult } from '../../../actions';

const idSchema = z.guid('Invalid id');
const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? v : null));

const updateRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(120, 'Room name is too long').optional(),
  fixed_architecture: nullableText(5000),
  design_brief: nullableText(5000),
  floor: nullableText(80),
  wing: nullableText(80),
});

export type UpdateRoomInput = {
  name?: string;
  fixed_architecture?: string | null;
  design_brief?: string | null;
  floor?: string | null;
  wing?: string | null;
};

export async function updateRoom(
  roomId: string,
  projectId: string,
  input: UpdateRoomInput
): Promise<ActionResult<Room>> {
  const ids = z.object({ roomId: idSchema, projectId: idSchema }).safeParse({ roomId, projectId });
  if (!ids.success) return { ok: false, error: ids.error.issues[0].message };
  const parsed = updateRoomSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const patch = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  ) as Partial<Pick<Room, 'name' | 'fixed_architecture' | 'design_brief' | 'floor' | 'wing'>>;
  if (Object.keys(patch).length === 0) return { ok: false, error: 'Nothing to update' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('rooms')
    .update(patch)
    .eq('id', ids.data.roomId)
    .eq('project_id', ids.data.projectId)
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'Room not found' };

  revalidatePath(`/projects/${ids.data.projectId}`);
  revalidatePath(`/projects/${ids.data.projectId}/rooms/${ids.data.roomId}`);
  return { ok: true, data };
}
