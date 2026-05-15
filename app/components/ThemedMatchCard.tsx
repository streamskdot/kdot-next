'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Match } from '@/lib/supabase'
import { MatchTimer, MatchStatusBadge } from './MatchTimer'
import { getLeagueTheme } from './leagueThemes'
import { useEffect, useState } from 'react'

interface TeamInfo {
  name: string
  logo_url: string | null
}

interface ThemedMatchCardProps {
  match: Match
  team1Data?: TeamInfo | null
  team2Data?: TeamInfo | null
  leagueSlug: string
  showAd?: boolean
}

function getLocalTimeInfo(displayTime: string | null, matchDate: string | null) {
  if (!displayTime) return { time: '', dateBadge: null }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let matchDateTime: Date

  if (matchDate) {
    const datePart = matchDate.split('T')[0]
    const utcDateStr = `${datePart}T${displayTime}:00Z`
    matchDateTime = new Date(utcDateStr)
  } else {
    const [hours, minutes] = displayTime.split(':').map(Number)
    const utcToday = new Date()
    utcToday.setUTCHours(hours, minutes, 0, 0)
    matchDateTime = utcToday
  }

  if (isNaN(matchDateTime.getTime())) {
    return { time: displayTime, dateBadge: null }
  }

  const localTime = matchDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const matchDay = new Date(matchDateTime.getFullYear(), matchDateTime.getMonth(), matchDateTime.getDate())

  let dateBadge: 'TODAY' | 'YESTERDAY' | null = null
  if (matchDay.getTime() === today.getTime()) {
    dateBadge = 'TODAY'
  } else if (matchDay.getTime() === yesterday.getTime()) {
    dateBadge = 'YESTERDAY'
  }

  return { time: localTime, dateBadge }
}

export function ThemedMatchCard({ match, team1Data, team2Data, leagueSlug, showAd = true }: ThemedMatchCardProps) {
  const theme = getLeagueTheme(leagueSlug)
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

  const { time: localTime, dateBadge } = getLocalTimeInfo(match.display_time, match.match_date)
  const durationHours = Number(
    (match.raw_data as { duration?: number } | null)?.duration ?? 2,
  )

  const isChampionsLeague = leagueSlug === 'champions-league'
  const isEuropaLeague = leagueSlug === 'europa-league'
  const isConferenceLeague = leagueSlug === 'uefa-conference-league-knockout-stage'
  const isPremierLeague = leagueSlug === 'premier-league'
  const isLaLiga = leagueSlug === 'laliga' || leagueSlug === 'la-liga'
  const isBundesliga = leagueSlug === 'bundesliga'
  const isSerieA = leagueSlug === 'serie-a'
  const isLigue1 = leagueSlug === 'ligue-1'
  const isFACup = leagueSlug === 'fa-cup'
  console.log('fa cup->', leagueSlug)
  const isThemed = isChampionsLeague || isEuropaLeague || isConferenceLeague || isPremierLeague || isLaLiga || isBundesliga || isSerieA || isLigue1 || isFACup
  const isLightThemed = isLigue1 // Ligue 1 has light background

  const colors = isDarkMode ? theme.darkColors : theme.colors
  const gradients = isDarkMode ? theme.darkGradients : theme.gradients

  const handleClick = () => {
    console.log('ThemedMatchCard clicked:', match.id)
    console.log('Has exoclick-trigger class:', true)
  }

  return (
    <Link href={`/match/${match.id}`} className={`block ${showAd ? 'exoclick-trigger' : ''}`} onClick={handleClick}>
      <div
        className="group relative overflow-hidden rounded-2xl border-2 transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
        style={{
          background: isThemed ? gradients.card : undefined,
          borderColor: isThemed ? colors.border : undefined,
        }}
      >
        {/* Decorative elements for Champions League */}
        {isChampionsLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">⭐</div>
            <div className="absolute bottom-2 left-2 text-3xl">⭐</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">⭐</div>
          </div>
        )}

        {/* Decorative elements for Europa League */}
        {isEuropaLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🔥</div>
            <div className="absolute bottom-2 left-2 text-3xl">🔥</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🔥</div>
          </div>
        )}

        {/* Decorative elements for Conference League */}
        {isConferenceLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🌿</div>
            <div className="absolute bottom-2 left-2 text-3xl">🌿</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🌿</div>
          </div>
        )}

        {/* Decorative elements for Premier League */}
        {isPremierLeague && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🦁</div>
            <div className="absolute bottom-2 left-2 text-3xl">🦁</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">👑</div>
          </div>
        )}

        {/* Decorative elements for La Liga */}
        {isLaLiga && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">⚽</div>
            <div className="absolute bottom-2 left-2 text-3xl">⚽</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🇪🇸</div>
          </div>
        )}

        {/* Decorative elements for Bundesliga */}
        {isBundesliga && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🇩🇪</div>
            <div className="absolute bottom-2 left-2 text-3xl">⚽</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🏆</div>
          </div>
        )}

        {/* Decorative elements for Serie A */}
        {isSerieA && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🇮🇹</div>
            <div className="absolute bottom-2 left-2 text-3xl">⚽</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🎯</div>
          </div>
        )}

        {/* Decorative elements for Ligue 1 */}
        {isLigue1 && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🇫🇷</div>
            <div className="absolute bottom-2 left-2 text-3xl">⚽</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🌟</div>
          </div>
        )}

        {/* Decorative elements for FA Cup */}
        {isFACup && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-2 right-2 text-4xl">🏆</div>
            <div className="absolute bottom-2 left-2 text-3xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🥇</div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute right-3 top-3 z-10">
          <MatchStatusBadge
            status={match.status}
            matchDate={match.match_date}
            displayTime={match.display_time}
            durationHours={durationHours}
          />
        </div>

        {/* Date Badge */}
        {dateBadge && (
          <div className="absolute left-3 top-3 z-10">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
              style={{
                backgroundColor: isThemed ? 'rgba(255, 255, 255, 0.2)' : undefined,
                color: isThemed ? '#ffffff' : undefined,
                backdropFilter: 'blur(8px)',
              }}
            >
              {dateBadge}
            </span>
          </div>
        )}

        {/* Teams */}
        <div className="relative flex items-center justify-between gap-4 p-5 pt-8">
          {/* Team 1 */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
              style={{
                backgroundColor: isThemed ? 'rgba(255, 255, 255, 0.15)' : undefined,
                backdropFilter: 'blur(8px)',
              }}
            >
              {team1Data?.logo_url ? (
                <Image
                  src={team1Data.logo_url}
                  alt={team1Data.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  unoptimized
                />
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
                >
                  {match.team1.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span
              className="line-clamp-2 text-center text-sm font-semibold"
              style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
            >
              {team1Data?.name || match.team1}
            </span>
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center gap-1 px-4">
            {match.team1_score != null && match.team2_score != null ? (
              <div
                className="flex items-center gap-2 text-3xl font-black"
                style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
              >
                <span>{match.team1_score}</span>
                <span className="opacity-60">-</span>
                <span>{match.team2_score}</span>
              </div>
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: isThemed && !isLightThemed ? 'rgba(255, 255, 255, 0.7)' : undefined }}
              >
                VS
              </span>
            )}
            {localTime && (
              <span
                className="text-xs font-medium"
                style={{ color: isThemed && !isLightThemed ? 'rgba(255, 255, 255, 0.8)' : undefined }}
              >
                {localTime}
              </span>
            )}
            <MatchTimer
              status={match.status}
              matchDate={match.match_date}
              displayTime={match.display_time}
              durationHours={durationHours}
              size="sm"
              className="mt-0.5"
            />
          </div>

          {/* Team 2 */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
              style={{
                backgroundColor: isThemed ? 'rgba(255, 255, 255, 0.15)' : undefined,
                backdropFilter: 'blur(8px)',
              }}
            >
              {team2Data?.logo_url ? (
                <Image
                  src={team2Data.logo_url}
                  alt={team2Data.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  unoptimized
                />
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
                >
                  {match.team2.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span
              className="line-clamp-2 text-center text-sm font-semibold"
              style={{ color: isThemed && !isLightThemed ? '#ffffff' : undefined }}
            >
              {team2Data?.name || match.team2}
            </span>
          </div>
        </div>

        {/* League badge at bottom */}
        {isThemed && (
          <div
            className="absolute bottom-0 left-0 right-0 px-4 py-2 text-center"
            style={{
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)',
            }}
          >
            <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
              {theme.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
