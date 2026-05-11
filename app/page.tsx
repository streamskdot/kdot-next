import { Suspense } from 'react'
import React from 'react'
import { Navbar } from './components/Navbar'
import { LeagueTabsClient } from './components/LeagueTabsClient'
import { MatchCard } from './components/MatchCard'
import { MatchesSkeleton } from './components/MatchesSkeleton'
import { LeagueLogo } from './components/LeagueLogo'
import { FeatureCards } from './components/FeatureCards'
import { ThemedMatchCard } from './components/ThemedMatchCard'
import { ThemedLeagueSection } from './components/ThemedLeagueSection'
import { AdsterraBanner468x60WithRefresh } from './components/adsterra/AdsterraBanner468x60Refresh'
import { supabase, type Match, type League } from '@/lib/supabase'
import { AdsterraBanner320x50WithRefresh } from './components/adsterra/AdsterraBanner320x50Refresh'

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
    const isThemedLeague = league === 'champions-league' || league === 'europa-league' || league === 'uefa-conference-league-knockout-stage' || league === 'premier-league' || league === 'laliga' || league === 'la-liga' || league === 'bundesliga' || league === 'serie-a' || league === 'ligue-1'

    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMatches.map((match, index) => (
            <React.Fragment key={match.id}>
              {isThemedLeague ? (
                <ThemedMatchCard
                  key={match.id}
                  match={match}
                  leagueSlug={league}
                  team1Data={teamsMap.get(match.team1) ?? null}
                  team2Data={teamsMap.get(match.team2) ?? null}
                  showAd={false}
                />
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  team1Data={teamsMap.get(match.team1) ?? null}
                  team2Data={teamsMap.get(match.team2) ?? null}
                  showAd={false}
                />
              )}
              {/* Insert mobile banner after every 2 match cards on mobile */}
              {(index + 1) % 2 === 0 && index !== sortedMatches.length - 1 && (
                <div className="lg:hidden col-span-full flex items-center justify-center py-2">
                  <AdsterraBanner320x50WithRefresh key={`mobile-${league}-${index}`} />
                </div>
              )}
              {/* Insert banner after every 3 match cards on desktop */}
              {(index + 1) % 3 === 0 && index !== sortedMatches.length - 1 && (
                <div className="hidden lg:block lg:col-span-full flex flex-row items-center justify-center gap-0 flex-nowrap">
                  <div className="flex flex-row gap-0" style={{ width: 936 }}>
                    <AdsterraBanner468x60WithRefresh key={`inline-1-${league}-${index}`} />
                    <AdsterraBanner468x60WithRefresh key={`inline-2-${league}-${index}`} />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Pop under banner if there are 3 or more match cards */}
        {sortedMatches.length >= 3 && (
          <div className="hidden lg:block mt-4 text-center flex flex-row items-center justify-center gap-0 flex-nowrap">
            <div className="flex flex-row gap-0" style={{ width: 936 }}>
              <AdsterraBanner468x60WithRefresh key={`popunder-1-${league}`} />
              <AdsterraBanner468x60WithRefresh key={`popunder-2-${league}`} />
            </div>
          </div>
        )}
      </>
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
        const isThemedLeague = lg.slug === 'champions-league' || lg.slug === 'europa-league' || lg.slug === 'uefa-conference-league-knockout-stage' || lg.slug === 'premier-league' || lg.slug === 'laliga' || lg.slug === 'la-liga' || lg.slug === 'bundesliga' || lg.slug === 'serie-a' || lg.slug === 'ligue-1'

        if (isThemedLeague) {
          return (
            <ThemedLeagueSection
              key={`${lg.slug}-${sectionMatches.map(m => m.id).join('-')}`}
              league={lg}
              matches={sectionMatches}
              teamsMap={teamsMap}
            />
          )
        }

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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sectionMatches.map((match, index) => (
                <React.Fragment key={match.id}>
                  <MatchCard
                    key={match.id}
                    match={match}
                    team1Data={teamsMap.get(match.team1) ?? null}
                    team2Data={teamsMap.get(match.team2) ?? null}
                    showAd={false}
                  />
                  {/* Insert mobile banner after every 2 match cards on mobile */}
                  {(index + 1) % 2 === 0 && index !== sectionMatches.length - 1 && (
                    <div className="lg:hidden col-span-full flex items-center justify-center py-2">
                      <AdsterraBanner320x50WithRefresh key={`mobile-${lg.slug}-${index}`} />
                    </div>
                  )}
                  {/* Insert banner after every 3 match cards on desktop */}
                  {(index + 1) % 3 === 0 && index !== sectionMatches.length - 1 && (
                    <div className="hidden lg:block lg:col-span-full flex flex-row items-center justify-center gap-0 flex-nowrap">
                      <div className="flex flex-row gap-0" style={{ width: 936 }}>
                        <AdsterraBanner468x60WithRefresh key={`inline-1-${lg.slug}-${index}`} />
                        <AdsterraBanner468x60WithRefresh key={`inline-2-${lg.slug}-${index}`} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Pop under banner if there are 3 or more match cards */}
            {sectionMatches.length >= 3 && (
              <div className="hidden lg:block mt-4 text-center flex flex-row items-center justify-center gap-0 flex-nowrap">
                <div className="flex flex-row gap-0" style={{ width: 936 }}>
                  <AdsterraBanner468x60WithRefresh key={`popunder-1-${lg.slug}`} />
                  <AdsterraBanner468x60WithRefresh key={`popunder-2-${lg.slug}`} />
                </div>
              </div>
            )}
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sectionMatches.map((match, index) => (
                <React.Fragment key={match.id}>
                  <MatchCard
                    key={match.id}
                    match={match}
                    team1Data={teamsMap.get(match.team1) ?? null}
                    team2Data={teamsMap.get(match.team2) ?? null}
                    showAd={false}
                  />
                  {/* Insert mobile banner after every 2 match cards on mobile */}
                  {(index + 1) % 2 === 0 && index !== sectionMatches.length - 1 && (
                    <div className="lg:hidden col-span-full flex items-center justify-center py-2">
                      <AdsterraBanner320x50WithRefresh key={`mobile-orphan-${slug}-${index}`} />
                    </div>
                  )}
                  {/* Insert banner after every 3 match cards on desktop */}
                  {(index + 1) % 3 === 0 && index !== sectionMatches.length - 1 && (
                    <div className="hidden lg:block lg:col-span-full flex flex-row items-center justify-center gap-0 flex-nowrap">
                      <div className="flex flex-row gap-0" style={{ width: 936 }}>
                        <AdsterraBanner468x60WithRefresh key={`inline-orphan-1-${slug}-${index}`} />
                        <AdsterraBanner468x60WithRefresh key={`inline-orphan-2-${slug}-${index}`} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Pop under banner if there are 3 or more match cards */}
            {sectionMatches.length >= 3 && (
              <div className="hidden lg:block mt-4 text-center flex flex-row items-center justify-center gap-0 flex-nowrap">
                <div className="flex flex-row gap-0" style={{ width: 936 }}>
                  <AdsterraBanner468x60WithRefresh key={`popunder-orphan-1-${slug}`} />
                  <AdsterraBanner468x60WithRefresh key={`popunder-orphan-2-${slug}`} />
                </div>
              </div>
            )}
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

