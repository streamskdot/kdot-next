-- Add thumbnail column to matches for ppv.to (and future) scrapers
alter table public.matches add column if not exists thumbnail text default null;

comment on column public.matches.thumbnail is 'External thumbnail URL (e.g. https://api.ppv.to/assets/thumb/...)';
