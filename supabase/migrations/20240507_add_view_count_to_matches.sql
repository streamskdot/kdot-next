-- Add view_count column to matches table to track page visits
-- This tracks visits to the detail page through direct links or from match cards

alter table public.matches add column if not exists view_count integer not null default 0;

-- Create RPC function to increment view count atomically
create or replace function public.increment_match_view_count(match_id text)
returns void
language plpgsql
security definer
as $$
begin
  update public.matches
  set view_count = view_count + 1
  where id = match_id;
end;
$$;

-- Grant execute permission to anon and authenticated users
grant execute on function public.increment_match_view_count(text) to anon, authenticated;
