-- Add is_highlighted column to matches table to feature specific matches
-- This allows highlighting important matches in the feature cards section

alter table public.matches add column if not exists is_highlighted boolean not null default false;
