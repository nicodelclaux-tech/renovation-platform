create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  address text,
  architectural_style text,
  style_bible jsonb not null default '{}'::jsonb,
  materials_palette jsonb not null default '[]'::jsonb,
  project_notes text,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  room_name text not null,
  floor text,
  room_type text,
  room_description text,
  fixed_architecture text,
  room_style_brief text,
  negative_constraints text,
  dimensions jsonb,
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  asset_type text not null,
  file_path text not null,
  tags text[] default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  parent_generation_id uuid references generations(id) on delete set null,
  prompt text not null,
  model text not null,
  image_path text,
  source_assets uuid[] default '{}',
  user_rating int,
  approved boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
