'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import type { Project } from '@/lib/types/database';

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const idSchema = z.guid('Invalid id');
const nameSchema = z.string().trim().min(1, 'Name is required').max(120, 'Name is too long');

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createProject(name: string): Promise<ActionResult<Project>> {
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: parsed.data, user_id: user.id })
    .select()
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Failed to create project' };

  revalidatePath('/projects');
  return { ok: true, data };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', parsed.data)
    .eq('user_id', user.id)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Project not found' };

  revalidatePath('/projects');
  return { ok: true };
}

export async function renameProject(id: string, name: string): Promise<ActionResult<Project>> {
  const parsed = z.object({ id: idSchema, name: nameSchema }).safeParse({ id, name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, user } = await getAuthedClient();
  if (!user) return { ok: false, error: 'You must be signed in' };

  const { data, error } = await supabase
    .from('projects')
    .update({ name: parsed.data.name, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: 'Project not found' };

  revalidatePath('/projects');
  revalidatePath(`/projects/${parsed.data.id}`);
  return { ok: true, data };
}
