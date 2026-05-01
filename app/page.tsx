import { Suspense } from 'react'
import { Navbar } from './components/Navbar'
import { LeagueTabsClient } from './components/LeagueTabsClient'
import { MatchCard } from './components/MatchCard'
import { MatchesSkeleton } from './components/MatchesSkeleton'
import { supabase, type Match, type League } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: Promise<{ league?: string }>
}

// Get current timestamp once at module level
const CURRENT_TIMESTAMP = Date.now()

async function getData(leagueSlug?: string) {
  // Fetch leagues
  const { data: leagues } = await supabase
    .from('leagues')
    .select('*')
    .eq('is_active', true)
    .eq('sport', 'football')
    .order('sort_order')

  // Fetch matches (upcoming, live, and ended within last 24h)
  const twentyFourHoursAgo = new Date(CURRENT_TIMESTAMP - 24 * 60 * 60 * 1000).toISOString()
  let matchesQuery = supabase
    .from('matches')
    .select('*')
    .or(`status.in.(live,upcoming),and(status.eq.ended,ended_at.gt.${twentyFourHoursAgo})`)

  // Filter by league if selected
  if (leagueSlug) {
    matchesQuery = matchesQuery.eq('league', leagueSlug)
  }

  const { data: matches } = await matchesQuery.order('match_date', { ascending: true })

  // Fetch teams for logo lookup
  const { data: teams } = await supabase
    .from('teams')
    .select('slug, name, logo_url')

  const teamsMap = new Map((teams ?? []).map(t => [t.slug, { name: t.name, logo_url: t.logo_url }]))

  return {
    leagues: (leagues ?? []) as League[],
    matches: (matches ?? []) as Match[],
    teamsMap,
  }
}

async function MatchesGrid({ league }: { league?: string }) {
  const { matches, teamsMap } = await getData(league)

  // Sort: live first, upcoming second, ended last
  const statusOrder = { live: 0, upcoming: 1, ended: 2 } as const
  const sortedMatches = [...matches].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    // Within same status, sort by date
    return new Date(a.match_date || 0).getTime() - new Date(b.match_date || 0).getTime()
  })

  if (sortedMatches.length === 0) {
    return (
      <div className="col-span-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <p className="text-zinc-500 dark:text-zinc-400">
          No matches found. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <>
      {sortedMatches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          team1Data={teamsMap.get(match.team1) ?? null}
          team2Data={teamsMap.get(match.team2) ?? null}
        />
      ))}
    </>
  )
}

export default async function Home({ searchParams }: HomeProps) {
  const { league } = await searchParams

  // First, get matches to determine which leagues have them
  const twentyFourHoursAgo = new Date(CURRENT_TIMESTAMP - 24 * 60 * 60 * 1000).toISOString()
  const { data: matchesWithLeagues } = await supabase
    .from('matches')
    .select('league')
    .or(`status.in.(live,upcoming),and(status.eq.ended,ended_at.gt.${twentyFourHoursAgo})`)

  // Get unique league slugs that have matches
  const leagueSlugsWithMatches = new Set(
    (matchesWithLeagues ?? []).map(m => m.league).filter(Boolean)
  )

  // Fetch only leagues that have matches
  const { data: leagues } = await supabase
    .from('leagues')
    .select('*')
    .eq('is_active', true)
    .eq('sport', 'football')
    .in('slug', Array.from(leagueSlugsWithMatches))
    .order('sort_order')

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 transition-colors dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 transition-colors dark:text-white sm:text-3xl">
              Upcoming & Live Football Matches
            </h1>
            <p className="mt-2 text-sm text-zinc-600 transition-colors dark:text-zinc-400">
              Stay updated with all the latest football action
            </p>
          </div>

          {/* League Tabs - No Suspense, renders immediately on client */}
          <LeagueTabsClient leagues={(leagues ?? []) as League[]} />

          {/* Matches Grid - Only this shows skeleton when loading */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense key={league || 'all'} fallback={<MatchesSkeleton />}>
              <MatchesGrid league={league} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

