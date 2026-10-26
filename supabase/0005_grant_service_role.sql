-- Fixes "permission denied for table X" when using the service_role key.
--
-- Turning off "Automatically expose new tables" during project setup (the
-- right call — it controls anon/authenticated access) also meant the
-- server's service_role key never got explicit table grants on tables
-- created afterward. service_role already bypasses RLS, but it still
-- needs these grants to touch the tables at all.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
