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

## Key folders

```text
/app                      Next.js App Router pages and API routes
/components               UI and feature components
/modules                  Business logic by domain
/services/openai          OpenAI image generation/editing services
/services/supabase        Supabase client/server utilities
/prompts                  Prompt templates and prompt assembly logic
/db/migrations            Supabase SQL schema
/types                    Shared TypeScript types
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
