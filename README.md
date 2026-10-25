# Kitchen Table

Shared meal planning, groceries, freezer, and recipes — built around
independent households that all draw from one shared recipe library.

## How it's shaped

- **Households** are private: dinner plan, grocery list, freezer inventory,
  and meal prep all belong to one household and aren't visible to others.
- **Recipes** are shared: any household can add a recipe, and every
  household can browse, favorite, or plan around any recipe — regardless
  of which household added it.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind)
- [Supabase](https://supabase.com) — Postgres database, to be wired for
  both household data and the shared recipe library
- [Vercel](https://vercel.com) — hosting, deploys automatically from this
  repo's default branch

## Status

Household PIN login is live. Routes exist for This Week, Groceries,
Freezer, Meal Prep, and Recipes, but the modules themselves are still
placeholders — only auth is real so far.

## How auth works

A household signs in with its name + PIN (`src/app/login`). The PIN is
checked server-side against a bcrypt hash in the `households` table, using
the Supabase **service role** key (`src/lib/supabase/admin.ts`), which
never reaches the browser. On success, a signed session cookie is set
(`src/lib/auth/session.ts`) naming that household. Every page calls
`requireSession()` and redirects to `/login` if there's no valid session.

Every table has Row Level Security enabled with **zero** policies — the
publishable (anon) key gets no direct table access at all, from the
browser or anywhere else. All reads and writes go through the Next.js
server, which scopes every query to the signed-in household in code.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in after creating a Supabase project
npm run dev
```

## Deploying

1. Create a free [Supabase](https://supabase.com) project, run
   `supabase/schema.sql` against it, and copy these into `.env.local` (and
   into Vercel's project environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     Project Settings > API Keys
   - `SUPABASE_SERVICE_ROLE_KEY` — the **Secret key** on that same page
     (never expose this one — server-only, no `NEXT_PUBLIC_` prefix)
   - `SESSION_SECRET` — any long random string (e.g. `openssl rand -base64 32`)
2. Import this repo into [Vercel](https://vercel.com/new) — it will
   auto-deploy on every push to the default branch.
3. To add a household, insert a row into `households` with a bcrypt hash
   of its PIN in `pin_hash` — there's no sign-up UI yet.
