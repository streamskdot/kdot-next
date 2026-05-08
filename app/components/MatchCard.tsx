'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Match } from '@/lib/supabase'
import { MatchTimer, MatchStatusBadge } from './MatchTimer'

interface TeamInfo {
  name: string
  logo_url: string | null
}

interface MatchCardProps {
  match: Match
  team1Data?: TeamInfo | null
  team2Data?: TeamInfo | null
}

function getLocalTimeInfo(displayTime: string | null, matchDate: string | null) {
  if (!displayTime) return { time: '', dateBadge: null }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let matchDateTime: Date

  if (matchDate) {
    // match_date is timestamptz (e.g., "2026-05-01T00:00:00Z" or "2026-05-01")
    // Extract just the date part
    const datePart = matchDate.split('T')[0]
    // Build proper UTC ISO string
    const utcDateStr = `${datePart}T${displayTime}:00Z`
    matchDateTime = new Date(utcDateStr)
  } else {
    // Fallback: treat display_time as UTC today
    const [hours, minutes] = displayTime.split(':').map(Number)
    const utcToday = new Date()
    utcToday.setUTCHours(hours, minutes, 0, 0)
    matchDateTime = utcToday
  }

  // Check if date is valid
  if (isNaN(matchDateTime.getTime())) {
    return { time: displayTime, dateBadge: null }
  }

  // Format local time
  const localTime = matchDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  // Determine date badge based on local date
  const matchDay = new Date(matchDateTime.getFullYear(), matchDateTime.getMonth(), matchDateTime.getDate())

  let dateBadge: 'TODAY' | 'YESTERDAY' | null = null
  if (matchDay.getTime() === today.getTime()) {
    dateBadge = 'TODAY'
  } else if (matchDay.getTime() === yesterday.getTime()) {
    dateBadge = 'YESTERDAY'
  }

  return { time: localTime, dateBadge }
}

export function MatchCard({ match, team1Data, team2Data }: MatchCardProps) {
  const { time: localTime, dateBadge } = getLocalTimeInfo(match.display_time, match.match_date)
  const durationHours = Number(
    (match.raw_data as { duration?: number } | null)?.duration ?? 2,
  )

  const dateBadgeColors = {
    TODAY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    YESTERDAY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }

  const handleClick = () => {
    console.log('MatchCard clicked:', match.id)
    console.log('Has exoclick-trigger class:', true)
  }

  return (
    <Link href={`/match/${match.id}`} className="block exoclick-trigger" onClick={handleClick}>
      <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer">
        {/* Status Badge (client-derived from kickoff time + duration) */}
        <div className="absolute right-3 top-3">
          <MatchStatusBadge
            status={match.status}
            matchDate={match.match_date}
            displayTime={match.display_time}
            durationHours={durationHours}
          />
        </div>

        {/* Date Badge (Today/Yesterday) */}
        {dateBadge && (
          <div className="absolute left-3 top-3">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${dateBadgeColors[dateBadge]}`}>
              {dateBadge}
            </span>
          </div>
        )}

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {/* Team 1 */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              {team1Data?.logo_url ? (
                <Image
                  src={team1Data.logo_url}
                  alt={team1Data.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-lg font-bold text-zinc-400">
                  {match.team1.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="line-clamp-2 text-center text-sm font-medium text-zinc-900 dark:text-white">
              {team1Data?.name || match.team1}
            </span>
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center gap-1 px-4">
            {match.team1_score != null && match.team2_score != null ? (
              <div className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-white">
                <span>{match.team1_score}</span>
                <span className="text-zinc-400">-</span>
                <span>{match.team2_score}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-zinc-400">VS</span>
            )}
            {localTime && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              {team2Data?.logo_url ? (
                <Image
                  src={team2Data.logo_url}
                  alt={team2Data.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-lg font-bold text-zinc-400">
                  {match.team2.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="line-clamp-2 text-center text-sm font-medium text-zinc-900 dark:text-white">
              {team2Data?.name || match.team2}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
