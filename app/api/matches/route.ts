import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Always fetch fresh data; no edge runtime needed.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Embed league + both teams via the named FK constraints in the matches schema.
const SELECT = `
  id,
  league,
  team1,
  team2,
  team1_score,
  team2_score,
  status,
  display_time,
  match_date,
  scraped_at,
  ended_at,
  league_data:leagues!matches_league_fkey ( name, slug, sport, logo_url ),
  team1_data:teams!matches_team1_fkey ( name, slug, short_name, logo_url, country ),
  team2_data:teams!matches_team2_fkey ( name, slug, short_name, logo_url, country )
`;

export async function GET(request: NextRequest) {
  if (!SUPABASE_URL || !ANON_KEY) {
    return Response.json(
      { error: 'Supabase env vars not configured' },
      { status: 500 },
    );
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  });

  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league');
  const status = searchParams.get('status');

  // Exclude ended matches older than 24h (defensive — cleanup_old_matches
  // runs server-side too).
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('matches')
    .select(SELECT)
    .or(`status.neq.ended,ended_at.gte.${cutoff}`)
    .order('match_date', { ascending: true, nullsFirst: false })
    .limit(500);

  if (league) query = query.eq('league', league);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ matches: data ?? [] });
}
