'use client'

import { LeagueLogo } from './LeagueLogo'
import { ThemedMatchCard } from './ThemedMatchCard'
import { getLeagueTheme } from './leagueThemes'
import type { Match, League } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface ThemedLeagueSectionProps {
  league: League
  matches: Match[]
  teamsMap: Map<string, { name: string; logo_url: string | null }>
}

export function ThemedLeagueSection({ league, matches, teamsMap }: ThemedLeagueSectionProps) {
  const theme = getLeagueTheme(league.slug)
  const [isDarkMode, setIsDarkMode] = useState(false)

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
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
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
            {matches.map((match) => (
              <ThemedMatchCard
                key={match.id}
                match={match}
                leagueSlug={league.slug}
                team1Data={teamsMap.get(match.team1) ?? null}
                team2Data={teamsMap.get(match.team2) ?? null}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
