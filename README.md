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

All five modules are built and wired to real data:

- **This Week** — a 9-day Saturday-to-Sunday dinner plan, anchored to the
  household's own timezone. Each day is a save-in-place form; a blank day
  is a normal open night.
- **Groceries** — one shared list per household, grouped dynamically by
  whatever store names that household uses. Three-state status (needed /
  out of stock / received).
- **Freezer** — searchable inventory with +/- quantity, an optional label
  and location.
- **Meal Prep** — a batch with an optional checklist; finishing a batch
  feeds the pack count straight into Freezer (matches an existing item by
  name, or creates one).
- **Recipes** — shared across every household, not scoped to one. Add,
  favorite (per household), tag, search, filter. Only the household that
  added a recipe can delete it.

Not yet built: editing a saved recipe, nested "family versions" of a
recipe, out-of-stock notifications, a measurement converter, and
simultaneous-edit conflict handling (two people editing the exact same
row at once) — all called out as later refinements in the original
product brainstorm, not regressions from anything that was working.

## How auth works

A household signs in with its name + PIN (`src/app/login`). The PIN is
checked server-side against a bcrypt hash in the `households` table, using
the Supabase **service role** key (`src/lib/supabase/admin.ts`), which
never reaches the browser. On success, a signed session cookie is set
(`src/lib/auth/session.ts`) naming that household, then the picker at
`/select-member` records which person in the household this device is
(remembered until they switch or sign out — see `src/app/household/members`
to add or remove people). Every page calls `requireMember()` and redirects
to `/login` or `/select-member` as needed if the session is incomplete.

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
3. Create a household at `/signup` — no manual SQL insert needed.
