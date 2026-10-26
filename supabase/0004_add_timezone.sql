-- Households need to know "what day is it for you" to get This Week's
-- Sat-Sun boundary right once more than one timezone is using the app.

alter table households add column timezone text not null default 'UTC';
