-- Kitchen Table — lock down direct table access
--
-- Resolves the TODO from schema.sql: PIN-based household auth doesn't map
-- to Supabase's auth.uid()-based RLS model, so instead of writing RLS
-- policies tied to Supabase Auth, every table below gets RLS enabled with
-- zero policies. That means the publishable (anon) key gets nothing, from
-- any table, ever — on purpose. All reads and writes go through the
-- Next.js server using the service_role key (which bypasses RLS) after
-- verifying a signed session cookie proves which household is asking.
-- See src/lib/auth/session.ts and src/lib/supabase/admin.ts.

alter table households enable row level security;
alter table household_members enable row level security;
alter table recipes enable row level security;
alter table recipe_favorites enable row level security;
alter table meal_plan_entries enable row level security;
alter table grocery_items enable row level security;
alter table freezer_items enable row level security;
alter table prep_batches enable row level security;
