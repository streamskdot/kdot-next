import { Suspense } from 'react'
import { Navbar } from './components/Navbar'
import { LeagueTabsClient } from './components/LeagueTabsClient'
import { MatchCard } from './components/MatchCard'
import { MatchesSkeleton } from './components/MatchesSkeleton'
import { LeagueLogo } from './components/LeagueLogo'
import { FeatureCards } from './components/FeatureCards'
import { supabase, type Match, type League } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: Promise<{ league?: string }>
}

// Get current timestamp once at module level
const CURRENT_TIMESTAMP = Date.now()

async function getData(leagueSlug?: string) {
  // Fetch football leagues
  const { data: leagues } = await supabase
    .from('leagues')
    .select('*')
    .eq('is_active', true)
    .eq('sport', 'football')
    .order('sort_order')

  // Get football league slugs to filter matches
  const footballLeagueSlugs = new Set((leagues ?? []).map(l => l.slug))

  // Fetch matches (upcoming, live, and ended within last 24h)
  const twentyFourHoursAgo = new Date(CURRENT_TIMESTAMP - 24 * 60 * 60 * 1000).toISOString()
  let matchesQuery = supabase
    .from('matches')
    .select('*')
    .or(`status.in.(live,upcoming),and(status.eq.ended,ended_at.gt.${twentyFourHoursAgo})`)
    .in('league', Array.from(footballLeagueSlugs))

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

const STATUS_ORDER = { live: 0, upcoming: 1, ended: 2 } as const

function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff
    return new Date(a.match_date || 0).getTime() - new Date(b.match_date || 0).getTime()
  })
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-zinc-500 dark:text-zinc-400">
        No matches found. Check back soon!
      </p>
    </div>
  )
}

async function MatchesGrid({ league }: { league?: string }) {
  const { leagues, matches, teamsMap } = await getData(league)

  if (matches.length === 0) {
    return <EmptyState />
  }

  // Single-league view: flat grid, existing behavior
  if (league) {
    const sortedMatches = sortMatches(matches)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            team1Data={teamsMap.get(match.team1) ?? null}
            team2Data={teamsMap.get(match.team2) ?? null}
          />
        ))}
      </div>
    )
  }

  // All-leagues view: group by league, ordered by league.sort_order
  const matchesByLeague = new Map<string, Match[]>()
  for (const match of matches) {
    const list = matchesByLeague.get(match.league) ?? []
    list.push(match)
    matchesByLeague.set(match.league, list)
  }

  // Leagues come pre-sorted by sort_order from the query
  const orderedLeagues = leagues.filter(l => matchesByLeague.has(l.slug))

  // Include any orphan league slugs (matches whose league isn't in the leagues table)
  // at the end, preserving stable order.
  const knownSlugs = new Set(orderedLeagues.map(l => l.slug))
  const orphanSlugs = Array.from(matchesByLeague.keys()).filter(s => !knownSlugs.has(s))

  return (
    <div className="flex flex-col gap-8">
      {orderedLeagues.map((lg) => {
        const sectionMatches = sortMatches(matchesByLeague.get(lg.slug) ?? [])
        return (
          <section key={lg.slug}>
            <div className="mb-3 flex items-center gap-2">
              <LeagueLogo
                src={lg.logo_url}
                alt=""
                className="h-6 w-6"
              />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {lg.name}
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {sectionMatches.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  team1Data={teamsMap.get(match.team1) ?? null}
                  team2Data={teamsMap.get(match.team2) ?? null}
                />
              ))}
            </div>
          </section>
        )
      })}
      {orphanSlugs.map((slug) => {
        const sectionMatches = sortMatches(matchesByLeague.get(slug) ?? [])
        return (
          <section key={slug}>
            <div className="mb-3 flex items-center gap-2">
              <LeagueLogo src={null} alt="" className="h-6 w-6" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {slug}
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {sectionMatches.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  team1Data={teamsMap.get(match.team1) ?? null}
                  team2Data={teamsMap.get(match.team2) ?? null}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
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
          <div className="mb-4">
            {/* <h1 className="text-2xl font-bold text-zinc-900 transition-colors dark:text-white sm:text-3xl">
              Browse Live Matches
            </h1> */}
                      {/* Feature Cards */}
          <FeatureCards />
          </div>

          {/* League Tabs - No Suspense, renders immediately on client */}
          <LeagueTabsClient leagues={(leagues ?? []) as League[]} />

          {/* Matches Grid - Only this shows skeleton when loading */}
          <div className="mt-6">
            <Suspense key={league || 'all'} fallback={<MatchesSkeleton />}>
              <MatchesGrid league={league} />
            </Suspense>
          </div>


        </div>
      </main>
    </div>
  )
}

