'use client'

import { useEffect, useState } from 'react'

/**
 * Parses a match's start time from its `match_date` (timestamptz) and
 * `display_time` ("HH:MM" UTC, as produced by the scraper).
 * Returns epoch ms for the kickoff, or NaN if either input is missing/invalid.
 */
export function computeStartMs(
  matchDate: string | null | undefined,
  displayTime: string | null | undefined,
): number {
  if (!displayTime) return NaN

  let dt: Date
  if (matchDate) {
    const datePart = matchDate.split('T')[0]
    dt = new Date(`${datePart}T${displayTime}:00Z`)
  } else {
    const [h, m] = displayTime.split(':').map(Number)
    dt = new Date()
    dt.setUTCHours(h || 0, m || 0, 0, 0)
  }
  const t = dt.getTime()
  return Number.isFinite(t) ? t : NaN
}

function formatDuration(ms: number, opts: { withSeconds?: boolean } = {}): string {
  if (ms <= 0) return '0s'
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) {
    return opts.withSeconds
      ? `${minutes}m ${String(seconds).padStart(2, '0')}s`
      : `${minutes}m`
  }
  return `${seconds}s`
}

type Size = 'sm' | 'md'
type Status = 'live' | 'ended' | 'upcoming'

interface MatchTimerProps {
  status: Status
  matchDate: string | null | undefined
  displayTime: string | null | undefined
  /** Expected match length in hours (defaults to 2). */
  durationHours?: number
  size?: Size
  className?: string
}

/**
 * Modular countdown / elapsed-time pill for a match.
 *
 *  - status === 'upcoming'  → amber "Starts in …" countdown
 *  - status === 'live'      → red "LIVE • …" elapsed-time pill (pulsing)
 *  - status === 'ended'     → nothing
 *
 * Ticks every second on the client. Returns null while SSR / before hydration
 * so the initial markup is always stable.
 */
export function MatchTimer({
  status,
  matchDate,
  displayTime,
  durationHours = 2,
  size = 'sm',
  className = '',
}: MatchTimerProps) {
  const startMs = computeStartMs(matchDate, displayTime)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (status === 'ended') return null
  if (!Number.isFinite(startMs)) return null
  if (now == null) return null // wait for client tick so SSR is stable

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-sm gap-1.5'
      : 'px-2 py-0.5 text-[10px] gap-1'
  const dotSize = size === 'md' ? 'h-1.5 w-1.5' : 'h-1 w-1'

  if (status === 'upcoming') {
    const remaining = startMs - now
    if (remaining <= 0) return null
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-50 font-semibold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ${sizeClasses} ${className}`}
      >
        <span className={`animate-pulse rounded-full bg-current ${dotSize}`} />
        Starts in {formatDuration(remaining, { withSeconds: true })}
      </span>
    )
  }

  // status === 'live' → elapsed time since kickoff
  const elapsed = now - startMs
  if (elapsed < 0) return null

  const endMs = startMs + durationHours * 3600 * 1000
  const isOvertime = now > endMs

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tabular-nums text-white ${
        isOvertime ? 'bg-zinc-700 dark:bg-zinc-600' : 'bg-red-600 dark:bg-red-500'
      } ${sizeClasses} ${className}`}
    >
      <span className={`animate-pulse rounded-full bg-white ${dotSize}`} />
      LIVE • {formatDuration(elapsed, { withSeconds: true })}
    </span>
  )
}
