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

Scaffolding only. Routes exist for This Week, Groceries, Freezer, Meal
Prep, and Recipes, but none are built yet — they're placeholders.

`supabase/schema.sql` has a draft schema for all of the above, not yet run
against a live project. It has an open TODO on how PIN-based household
access maps to Postgres row-level security — that needs a decision before
any real data goes in.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in after creating a Supabase project
npm run dev
```

## Deploying

1. Create a free [Supabase](https://supabase.com) project, run
   `supabase/schema.sql` against it, and copy its URL + anon key into
   `.env.local` (and into Vercel's project environment variables).
2. Import this repo into [Vercel](https://vercel.com/new) — it will
   auto-deploy on every push to the default branch.
