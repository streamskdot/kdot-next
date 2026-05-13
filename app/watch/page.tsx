import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import WatchClient from './WatchClient'

export const runtime = 'edge'

async function getMatchForMeta(id: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('team1, team2, status, league, match_date')
    .eq('id', id)
    .single()

  if (!match) return null

  const { data: teams } = await supabase
    .from('teams')
    .select('slug, name')
    .in('slug', [match.team1, match.team2])

  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('slug', match.league)
    .single()

  const map = new Map((teams ?? []).map(t => [t.slug, t.name]))
  return {
    team1Name: map.get(match.team1) || match.team1,
    team2Name: map.get(match.team2) || match.team2,
    status: match.status,
    leagueName: league?.name || null,
  }
}

interface WatchPageProps {
  searchParams: Promise<{ url?: string; match?: string; n?: string }>
}

export async function generateMetadata({ searchParams }: WatchPageProps): Promise<Metadata> {
  const { match: matchId } = await searchParams
  const meta = matchId ? await getMatchForMeta(matchId) : null

  if (meta) {
    const title = `Watch ${meta.team1Name} vs ${meta.team2Name} Live HD${meta.leagueName ? ` - ${meta.leagueName}` : ''}`
    return {
      title,
      description: `Watch ${meta.team1Name} vs ${meta.team2Name} live in HD${meta.leagueName ? ` in the ${meta.leagueName}` : ''}. Multiple stream links available on kdotTV.`,
    }
  }

  return {
    title: 'Watch Live Stream',
    description: 'Watch your favorite sports live in HD on kdotTV. Multiple stream links available.',
  }
}

export default function WatchPage() {
  return <WatchClient />
}
