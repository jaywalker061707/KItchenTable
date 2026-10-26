-- Kitchen Table — initial schema draft
--
-- Two circles, per the product brainstorm:
--   1. Households: private planning units (dinner plan, groceries, freezer,
--      prep). Each household is its own row; data below is scoped to one
--      via household_id.
--   2. Recipes: a single shared library across every household. A recipe
--      records which household contributed it, but no household owns it —
--      any household can browse, favorite, or plan a dinner around it.
--
-- Row Level Security: every table has RLS enabled with zero policies (see
-- the bottom of this file). PIN-based household auth doesn't map to
-- Supabase's auth.uid() model, so instead of RLS policies, the Next.js
-- server verifies a signed session cookie and queries with the
-- service_role key (which bypasses RLS), scoping every query to the
-- session's household_id in application code. The publishable (anon) key
-- gets no direct table access, by design.

create extension if not exists "pgcrypto";

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin_hash text not null,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness, enforced at the database level so a race
-- between two simultaneous signups can't create a duplicate household name.
create unique index households_name_unique_idx on households (lower(name));

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  tags text[] not null default '{}',
  created_by_household_id uuid references households (id) on delete set null,
  created_by_member_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table recipe_favorites (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (recipe_id, household_id)
);

create table meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  plan_date date not null,
  recipe_id uuid references recipes (id) on delete set null,
  meal_name text,
  note text,
  created_at timestamptz not null default now()
);

create table grocery_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  store text not null,
  name text not null,
  quantity text,
  status text not null default 'needed' check (status in ('needed', 'out_of_stock', 'received')),
  created_at timestamptz not null default now()
);

create table freezer_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  label text,
  quantity numeric not null default 0,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table prep_batches (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  steps jsonb not null default '[]',
  packs_produced integer,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table households enable row level security;
alter table household_members enable row level security;
alter table recipes enable row level security;
alter table recipe_favorites enable row level security;
alter table meal_plan_entries enable row level security;
alter table grocery_items enable row level security;
alter table freezer_items enable row level security;
alter table prep_batches enable row level security;
