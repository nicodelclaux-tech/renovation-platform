-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style_bible JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floor TEXT,
  wing TEXT,
  fixed_architecture TEXT DEFAULT '',
  design_brief TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generations (AI renders)
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  master_prompt TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','generating','completed','failed','approved')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own rooms" ON rooms FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users see own generations" ON generations FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())));
CREATE POLICY "Users see own chat" ON chat_messages FOR ALL USING (room_id IN (SELECT id FROM rooms WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())));

-- Storage bucket for renders
INSERT INTO storage.buckets (id, name, public) VALUES ('renders', 'renders', true) ON CONFLICT DO NOTHING;

-- Room assets (see db/migrations/002_room_assets.sql). Idempotent.

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
