-- Matches table: scraped match data from yosintv.
-- Depends on `leagues` (20240101000001) and `teams` (20240101000002).

create table if not exists public.matches (
  id              text primary key,

  -- League slug (FK to leagues.slug). Cascade so deleting a league removes
  -- its matches.
  league          text not null
                  references public.leagues(slug) on delete cascade,

  -- Team slugs (FK to teams.slug). Named constraints so the API can
  -- disambiguate which team is home vs away in joins.
  team1           text not null,
  team2           text not null,
  constraint matches_team1_fkey foreign key (team1)
    references public.teams(slug) on delete cascade,
  constraint matches_team2_fkey foreign key (team2)
    references public.teams(slug) on delete cascade,

  team1_score     text,
  team2_score     text,
  status          text not null check (status in ('live','ended','upcoming')),
  display_time    text,
  match_date      timestamptz,
  first_seen_at   timestamptz not null default now(),
  scraped_at      timestamptz not null default now(),
  ended_at        timestamptz,
  raw_data        jsonb
);

-- Stream links scraped from the per-match details page (yosintv).
-- Stored as a JSONB array of decoded stream URLs; null when none found.
alter table public.matches add column if not exists stream_links jsonb default null;

create index if not exists matches_league_idx     on public.matches (league);
create index if not exists matches_team1_idx      on public.matches (team1);
create index if not exists matches_team2_idx      on public.matches (team2);
create index if not exists matches_status_idx     on public.matches (status);
create index if not exists matches_scraped_at_idx on public.matches (scraped_at desc);
create index if not exists matches_ended_at_idx   on public.matches (ended_at);
create index if not exists idx_matches_stream_links on public.matches using gin (stream_links) where stream_links is not null;

-- Cleanup: delete ended matches older than 24h
create or replace function public.cleanup_old_matches()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from public.matches
   where status = 'ended'
     and ended_at is not null
     and ended_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- RLS: public anon can read, only service_role writes.
alter table public.matches enable row level security;

drop policy if exists "matches_public_read" on public.matches;
create policy "matches_public_read"
  on public.matches
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon/authenticated => service_role bypasses RLS.

revoke all on function public.cleanup_old_matches() from public;
grant execute on function public.cleanup_old_matches() to service_role;
