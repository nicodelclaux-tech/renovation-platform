# Renovation Platform — Full Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transform the scaffold into a functional AI-powered renovation platform where users can create projects, define rooms, manage a style bible, generate AI renders, compare iterations, and chat with an AI designer.

**Architecture:** Next.js App Router + Supabase (auth, DB, storage) + OpenAI gpt-image-1 for renders + OpenRouter for chat reasoning. Server Actions for mutations, client components for interactivity.

**Tech Stack:** Next.js 16, Tailwind v4, Supabase (auth + postgres + storage), OpenAI SDK, Framer Motion, Zod

---

## Phase 1: Database & Auth Foundation

### Task 1: Supabase Schema Setup

**Objective:** Create all tables in Supabase for the data model.

**SQL to run in Supabase SQL Editor:**

```sql
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
```

**Files:**
- Create: `supabase/schema.sql` (reference copy)

---

### Task 2: Supabase Client Refactor

**Objective:** Proper client/server Supabase clients with typed schema.

**Files:**
- Modify: `lib/supabase.ts` → client-side singleton
- Create: `lib/supabase-server.ts` → server-side with cookies
- Create: `lib/types/database.ts` → TypeScript types for all tables

---

### Task 3: Auth (Login/Signup)

**Objective:** Email/password auth with Supabase. Middleware protecting dashboard routes.

**Files:**
- Create: `app/(auth)/login/page.tsx` — login form
- Create: `app/(auth)/signup/page.tsx` — signup form  
- Create: `middleware.ts` — redirect unauthenticated users
- Create: `lib/auth.ts` — helpers (getCurrentUser, signOut)

---

## Phase 2: Project & Room CRUD

### Task 4: Projects List Page

**Objective:** Dashboard home shows user's projects with create button.

**Files:**
- Modify: `app/page.tsx` → redirect to `/projects`
- Create: `app/(dashboard)/projects/page.tsx` — project grid
- Create: `app/(dashboard)/projects/actions.ts` — server actions (createProject, deleteProject)
- Create: `components/project/ProjectCard.tsx`

---

### Task 5: Project Detail & Room Management

**Objective:** Single project view with rooms list, style bible editor, and add-room form.

**Files:**
- Create: `app/(dashboard)/projects/[projectId]/page.tsx`
- Create: `app/(dashboard)/projects/[projectId]/actions.ts` — (createRoom, updateStyleBible)
- Modify: `components/project/HouseStyleBible.tsx` → editable with save to DB

---

### Task 6: Room Detail Page (Wired)

**Objective:** Room page with real data — shows generations, inspector, and canvas.

**Files:**
- Modify: `app/(dashboard)/projects/[projectId]/rooms/[roomId]/page.tsx` — fetch room + generations from Supabase
- Modify: `components/room/RoomCanvas.tsx` → render real generation cards with images
- Modify: `components/room/RoomInspector.tsx` → editable fields that save to DB
- Create: `app/(dashboard)/projects/[projectId]/rooms/[roomId]/actions.ts`

---

## Phase 3: AI Generation Pipeline

### Task 7: Generation API (Full Pipeline)

**Objective:** POST `/api/generate` → Architect prompt → gpt-image-1 → save to Supabase Storage → return URL.

**Files:**
- Rewrite: `app/api/generate-image/route.ts` — full pipeline:
  1. Fetch room facts + project style bible from Supabase
  2. Call OpenRouter Claude to craft master architectural prompt
  3. Call OpenAI gpt-image-1 with master prompt
  4. Upload result to Supabase Storage (`renders` bucket)
  5. Insert generation record with public URL
  6. Return generation object

---

### Task 8: Generation UI (Trigger + Status)

**Objective:** "Generate" button in room view triggers API, shows loading state, renders result.

**Files:**
- Create: `components/generation/GenerateButton.tsx` — triggers generation with loading/success states
- Modify: `components/generation/GenerationCard.tsx` → show real image, status badge, approve action
- Create: `hooks/useGeneration.ts` — mutation hook with optimistic UI

---

### Task 9: Image Comparison (Before/After)

**Objective:** Wire ComparisonView to allow comparing two generation iterations.

**Files:**
- Modify: `components/generation/ComparisonView.tsx` → accept two generation IDs, fetch images
- Add comparison mode toggle to RoomCanvas

---

## Phase 4: AI Chat Designer

### Task 10: Chat API Enhancement

**Objective:** Streaming chat with context-aware responses. Can trigger generation from chat.

**Files:**
- Rewrite: `app/api/chat-designer/route.ts`:
  - Stream response (ReadableStream)
  - Include room facts + style bible in system prompt
  - Detect intent to generate → auto-trigger generation
  - Save messages to `chat_messages` table

---

### Task 11: Chat UI (Full Implementation)

**Objective:** Real-time chat panel with streaming responses, message history from DB.

**Files:**
- Rewrite: `components/layout/DesignChat.tsx`:
  - Fetch message history from Supabase on mount
  - Stream responses with typing indicator
  - Auto-scroll, markdown rendering
  - "Generate from this" action on assistant messages

---

## Phase 5: Dynamic Sidebar & Navigation

### Task 12: Dynamic Sidebar

**Objective:** Sidebar shows real projects and rooms from DB, with active state.

**Files:**
- Rewrite: `components/layout/DashboardShell.tsx` — fetch projects/rooms, highlight active route
- Create: `components/layout/SidebarNav.tsx` — recursive project→room tree

---

## Phase 6: Polish & UX

### Task 13: Framer Motion Animations

**Objective:** Page transitions, generation card entrance, comparison slider feel.

**Files:**
- Create: `components/ui/AnimatedPage.tsx` — page wrapper with fade/slide
- Modify: `GenerationCard.tsx` — staggered entrance animation
- Modify: `ComparisonView.tsx` — spring slider physics

---

### Task 14: Responsive + Loading States

**Objective:** Skeleton loaders, responsive sidebar collapse, error boundaries.

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Create: `components/ui/ErrorBoundary.tsx`
- Create: `app/(dashboard)/loading.tsx`
- Modify: `DashboardShell.tsx` — collapsible sidebar on mobile

---

### Task 15: Remove Legacy Code

**Objective:** Clean up PocketBase references, unused services.

**Files:**
- Delete: `services/ai/orchestrator.ts` (PocketBase-based, replaced by Task 7)
- Delete: `services/supabase/client.ts` and `server.ts` (replaced by lib/)
- Remove: `pocketbase` from package.json
- Verify: no remaining PocketBase imports

---

## Execution Order

1. **Task 1** (schema) → manual in Supabase dashboard
2. **Tasks 2-3** (auth + types) → foundation
3. **Tasks 4-6** (CRUD) → can demo with real data
4. **Tasks 7-9** (AI generation) → core value prop
5. **Tasks 10-11** (chat) → differentiation
6. **Task 12** (dynamic sidebar) → ties it together
7. **Tasks 13-15** (polish + cleanup) → production-ready

---

## Environment Variables Needed (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://jnwjmuahutzmixddtskx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
OPENAI_API_KEY=<already set>
OPENROUTER_API_KEY=<for Claude chat>
```
