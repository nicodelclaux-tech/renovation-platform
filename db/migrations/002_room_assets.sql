-- 002_room_assets.sql
-- Room-level asset uploads: reference photos of the existing room, floor plans,
-- mood/reference images. Files live in the private 'assets' storage bucket under
-- '<user_id>/<room_id>/<uuid>-<filename>'; rows here hold metadata.
-- Idempotent: safe to re-run.

create table if not exists room_assets (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  kind text not null default 'other' check (kind in ('photo', 'floor_plan', 'reference', 'other')),
  storage_path text not null,
  file_name text,
  mime_type text,
  size_bytes int,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists room_assets_room_id_idx on room_assets (room_id, created_at desc);

alter table room_assets enable row level security;

drop policy if exists "Users see own room assets" on room_assets;
create policy "Users see own room assets" on room_assets
  for all
  using (room_id in (select id from rooms where project_id in (select id from projects where user_id = auth.uid())))
  with check (room_id in (select id from rooms where project_id in (select id from projects where user_id = auth.uid())));

-- Private storage bucket for room assets (access via signed URLs only)
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do update set public = false;

-- Storage policies: users may only touch objects under '<their user id>/...'
drop policy if exists "Users upload own assets" on storage.objects;
create policy "Users upload own assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users read own assets" on storage.objects;
create policy "Users read own assets" on storage.objects
  for select to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own assets" on storage.objects;
create policy "Users delete own assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
