# Renovation AI Dashboard Scaffold

A Next.js + Supabase + OpenAI scaffold for a room-by-room renovation visualization platform.

## Core idea

This app is designed to become an AI architectural memory system for a full house renovation. It separates:

- **Fixed architectural facts**: geometry, windows, doors, ceiling height, structural features
- **Creative variables**: furniture, palette, styling, textiles, lighting, artwork

## Suggested setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | one of these two | Supabase publishable key (preferred) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | one of these two | Legacy Supabase anon key (fallback) |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server-only key for `createAdminClient` in `lib/supabase-server.ts` (bypasses RLS; never expose to the client) |
| `OPENAI_API_KEY` | yes | Image generation (`app/api/generate-image`) |
| `OPENROUTER_API_KEY` | yes | LLM calls via OpenRouter (`app/api/chat-designer`, `app/api/generate-image`) |

## Key folders

```text
/app/(auth)               Login and signup pages
/app/(dashboard)          Authenticated pages (projects, rooms) wrapped in DashboardShell
/app/api/*                Route handlers (generate-image, chat-designer)
/proxy.ts                 Session refresh + route protection (Next 16 proxy, formerly middleware)
/lib                      Supabase clients, auth helpers, database types (lib/types)
/utils/supabase           @supabase/ssr helpers: browser client, server client, proxy session
/components/layout        Dashboard shell, sidebar, design chat
/components/project       Project and room management UI
/components/room          Room canvas and inspector
/components/generation    Generation cards, comparison view
/components/ui            Shared primitives (Skeleton, ErrorBoundary, AnimatedPage)
/modules                  Business logic by domain
/prompts                  Prompt templates and prompt assembly logic
/supabase/schema.sql      Full Supabase schema with RLS policies
/db/migrations            SQL migrations
/docs                     Product and engineering documentation
```

## Build order

1. Wire Supabase auth
2. Create projects and rooms CRUD
3. Add asset upload
4. Add image generation route
5. Add image edit route
6. Add version history
7. Add side-by-side comparison
8. Add style bible and room brief memory
