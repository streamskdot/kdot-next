'use client'

import React from 'react'
import { LeagueLogo } from './LeagueLogo'
import { ThemedMatchCard } from './ThemedMatchCard'
import { getLeagueTheme } from './leagueThemes'
import { AdSlot468x60, AdSlot320x50 } from './AdSlot'
import type { Match, League } from '@/lib/supabase'
import { useEffect, useState, useMemo } from 'react'
import { deriveMatchStatus, computeStartMs } from './MatchTimer'
import { AdsterraBanner320x50WithRefreshOffset } from './adsterra/AdsterraBanner320x50WithRefreshOffset'
import { AdsterraBanner468x60WithRefresh } from './adsterra/AdsterraBanner468x60Refresh'
import { AdstuffBanner300x250WithRefresh } from './adstuff/AdstuffBanner300x250Refresh'

interface ThemedLeagueSectionProps {
  league: League
  matches: Match[]
  teamsMap: Map<string, { name: string; logo_url: string | null }>
}

const STATUS_ORDER = { live: 0, upcoming: 1, ended: 2 } as const

function sortMatches(matches: Match[]): Match[] {
  const nowMs = Date.now()
  const sorted = [...matches].sort((a, b) => {
    // Calculate client-side status from duration instead of using backend status
    const durationHoursA = Number((a.raw_data as { duration?: number } | null)?.duration ?? 2)
    const durationHoursB = Number((b.raw_data as { duration?: number } | null)?.duration ?? 2)
    
    const statusA = deriveMatchStatus(a.match_date, a.display_time, durationHoursA, a.status as 'live' | 'upcoming' | 'ended', nowMs)
    const statusB = deriveMatchStatus(b.match_date, b.display_time, durationHoursB, b.status as 'live' | 'upcoming' | 'ended', nowMs)
    
    const statusDiff = STATUS_ORDER[statusA] - STATUS_ORDER[statusB]
    if (statusDiff !== 0) return statusDiff
    
    // Secondary sort by match date
    const startMsA = computeStartMs(a.match_date, a.display_time)
    const startMsB = computeStartMs(b.match_date, b.display_time)
    if (Number.isFinite(startMsA) && Number.isFinite(startMsB)) {
      return startMsA - startMsB
    }
    return 0
  })
  return sorted
}

export function ThemedLeagueSection({ league, matches, teamsMap }: ThemedLeagueSectionProps) {
  const theme = getLeagueTheme(league.slug)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Sort matches on client side
  const sortedMatches = useMemo(() => sortMatches(matches), [matches])

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const isChampionsLeague = league.slug === 'champions-league'
  const isEuropaLeague = league.slug === 'europa-league'
  const isConferenceLeague = league.slug === 'uefa-conference-league-knockout-stage'
  const isPremierLeague = league.slug === 'premier-league'
  const isLaLiga = league.slug === 'laliga' || league.slug === 'la-liga'
  const isBundesliga = league.slug === 'bundesliga'
  const isSerieA = league.slug === 'serie-a'
  const isLigue1 = league.slug === 'ligue-1'
  const isThemed = isChampionsLeague || isEuropaLeague || isConferenceLeague || isPremierLeague || isLaLiga || isBundesliga || isSerieA || isLigue1
  const isLightThemed = isLigue1 // Ligue 1 has light background

  const colors = isDarkMode ? theme.darkColors : theme.colors
  const gradients = isDarkMode ? theme.darkGradients : theme.gradients

  return (
    <section>
      {/* Unified container with header and matches */}
      <div
        className="overflow-hidden rounded-2xl border-2 shadow-lg"
        style={{
          background: isThemed ? gradients.header : undefined,
          borderColor: isThemed ? colors.border : undefined,
        }}
      >
        {/* Decorative elements for Champions League */}
        {isChampionsLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">⭐</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">⭐</div>
          </div>
        )}

        {/* Decorative elements for Europa League */}
        {isEuropaLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🔥</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🔥</div>
          </div>
        )}

        {/* Decorative elements for Conference League */}
        {isConferenceLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🌿</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🌿</div>
          </div>
        )}

        {/* Decorative elements for Premier League */}
        {isPremierLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🦁</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">👑</div>
          </div>
        )}

        {/* Decorative elements for La Liga */}
        {isLaLiga && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">⚽</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🇪🇸</div>
          </div>
        )}

        {/* Decorative elements for Bundesliga */}
        {isBundesliga && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🇩🇪</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🏆</div>
          </div>
        )}

        {/* Decorative elements for Serie A */}
        {isSerieA && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🇮🇹</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🎯</div>
          </div>
        )}

        {/* Decorative elements for Ligue 1 */}
        {isLigue1 && (
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 text-8xl">🇫🇷</div>
            <div className="absolute -bottom-10 -left-10 text-8xl">🌟</div>
          </div>
        )}

        {/* Compact League Header */}
        <div className="relative flex items-center gap-3 px-5 py-3 border-b border-white/10">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg shadow"
            style={{
              backgroundColor: isThemed ? 'rgba(255, 255, 255, 0.2)' : undefined,
              backdropFilter: 'blur(8px)',
            }}
          >
            <LeagueLogo
              src={league.logo_url}
              alt=""
              className="h-5 w-5"
            />
          </div>
          <div className="flex-1">
            <h2
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
            >
              {league.name}
            </h2>
            <span
              className="text-xs font-medium"
              style={{ color: isThemed && !isLightThemed ? 'rgba(255, 255, 255, 0.7)' : undefined }}
            >
              {sortedMatches.length} {sortedMatches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          {isChampionsLeague && (
            <div className="text-2xl opacity-50">🏆</div>
          )}
          {isEuropaLeague && (
            <div className="text-2xl opacity-50">🔥</div>
          )}
          {isConferenceLeague && (
            <div className="text-2xl opacity-50">🌿</div>
          )}
          {isPremierLeague && (
            <div className="text-2xl opacity-50">👑</div>
          )}
          {isLaLiga && (
            <div className="text-2xl opacity-50">🇪🇸</div>
          )}
          {isBundesliga && (
            <div className="text-2xl opacity-50">🏆</div>
          )}
          {isSerieA && (
            <div className="text-2xl opacity-50">🎯</div>
          )}
          {isLigue1 && (
            <div className="text-2xl opacity-50">🌟</div>
          )}
        </div>

        {/* Match Cards Grid - Inside the container */}
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedMatches.map((match, index) => (
              <React.Fragment key={match.id}>
                <ThemedMatchCard
                  match={match}
                  leagueSlug={league.slug}
                  team1Data={teamsMap.get(match.team1) ?? null}
                  team2Data={teamsMap.get(match.team2) ?? null}
                  showAd={false}
                />
                {/* Insert mobile banner after every 2 match cards on mobile */}
                {(index + 1) % 2 === 0 && index !== sortedMatches.length - 1 && (
                  <div className="lg:hidden col-span-full flex flex-col items-center justify-center gap-2 py-2">
                    <AdsterraBanner320x50WithRefreshOffset key={`mobile-banner-1-${index}`} />
                    <AdsterraBanner320x50WithRefreshOffset key={`mobile-banner-2-${index}`} />
                  </div>
                )}
                {/* Insert banner after every 3 match cards on desktop */}
                {(index + 1) % 3 === 0 && index !== matches.length - 1 && (
                  <div className="hidden lg:block lg:col-span-full flex flex-row items-center justify-center gap-0 flex-nowrap">
                    <div className="flex flex-row gap-0" style={{ width: 936 }}>
                      <AdsterraBanner468x60WithRefresh key={`banner-1-${index}`} />
                      <AdsterraBanner468x60WithRefresh key={`banner-2-${index}`} />
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
                <AdsterraBanner468x60WithRefresh key={`banner-1`} />
                <AdsterraBanner468x60WithRefresh key={`banner-2`} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Adstuff banner below ThemedLeagueSection (mobile only) */}
      <div className="mt-4 flex items-center justify-center lg:hidden">
        {/* <AdstuffBanner300x250WithRefresh key={`adstuff-${league.slug}`} /> */}
      </div>
    </section>
  )
}
