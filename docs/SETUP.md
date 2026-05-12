# Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3. Run Supabase migration

Apply:

```text
db/migrations/001_initial_schema.sql
```

## 4. Start local app

```bash
npm run dev
```
