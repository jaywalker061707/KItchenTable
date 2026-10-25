-- Prevents two households from registering the same name (case-insensitive).
-- Enforced at the database level, not just in application code, so a race
-- between two simultaneous signups can't create a duplicate.

create unique index households_name_unique_idx on households (lower(name));
