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
export type MatchStatus = 'live' | 'ended' | 'upcoming'

/**
 * Derive a match's live/upcoming/ended status purely from its kickoff time
 * and expected duration. Falls back to `fallback` when the times are missing
 * (e.g. the scraper never produced a `display_time`).
 */
export function deriveMatchStatus(
  matchDate: string | null | undefined,
  displayTime: string | null | undefined,
  durationHours: number,
  fallback: MatchStatus,
  nowMs: number = Date.now(),
): MatchStatus {
  const startMs = computeStartMs(matchDate, displayTime)
  if (!Number.isFinite(startMs)) return fallback
  const endMs = startMs + durationHours * 3600 * 1000
  if (nowMs < startMs) return 'upcoming'
  if (nowMs > endMs) return 'ended'
  return 'live'
}

/**
 * React hook: returns the client-derived match status, re-evaluated every
 * `intervalMs` ms. Returns `fallback` on the server / before the first tick
 * so SSR markup stays stable.
 */
export function useDerivedMatchStatus(
  matchDate: string | null | undefined,
  displayTime: string | null | undefined,
  durationHours: number,
  fallback: MatchStatus,
  intervalMs: number = 15_000,
): MatchStatus {
  const [status, setStatus] = useState<MatchStatus>(fallback)

  useEffect(() => {
    const tick = () =>
      setStatus(deriveMatchStatus(matchDate, displayTime, durationHours, fallback))
    tick()
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [matchDate, displayTime, durationHours, fallback, intervalMs])

  return status
}

interface MatchTimerProps {
  /** DB status used as a fallback when times are missing. */
  status: MatchStatus
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

  if (!Number.isFinite(startMs)) return null
  if (now == null) return null // wait for client tick so SSR is stable

  // Derive the *current* status from time-of-day instead of trusting the DB
  // value, which may be stale between scrapes.
  const derived = deriveMatchStatus(matchDate, displayTime, durationHours, status, now)
  if (derived === 'ended') return null

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-sm gap-1.5'
      : 'px-2 py-0.5 text-[10px] gap-1'
  const dotSize = size === 'md' ? 'h-1.5 w-1.5' : 'h-1 w-1'

  if (derived === 'upcoming') {
    const remaining = startMs - now
    if (remaining <= 0) return null
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-50 font-semibold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ${sizeClasses} ${className}`}
      >
        <span className={`animate-pulse rounded-full bg-current ${dotSize}`} />
        {formatDuration(remaining, { withSeconds: true })}
      </span>
    )
  }

  // derived === 'live' → elapsed time since kickoff
  const elapsed = now - startMs
  if (elapsed < 0) return null

  return (
    <span
      className={`inline-flex items-center rounded-full bg-red-600 font-semibold tabular-nums text-white dark:bg-red-500 ${sizeClasses} ${className}`}
    >
      <span className={`animate-pulse rounded-full bg-white ${dotSize}`} />
      LIVE • {formatDuration(elapsed, { withSeconds: true })}
    </span>
  )
}

// --------------------------------------------------------------------------
// MatchStatusBadge
// --------------------------------------------------------------------------

interface MatchStatusBadgeProps {
  status: MatchStatus
  matchDate: string | null | undefined
  displayTime: string | null | undefined
  durationHours?: number
  size?: Size
  className?: string
}

const STATUS_STYLES: Record<MatchStatus, string> = {
  live: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  upcoming: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  ended: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  live: 'LIVE',
  upcoming: 'UPCOMING',
  ended: 'ENDED',
}

/**
 * Live/upcoming/ended pill whose status is derived client-side from the
 * kickoff time + expected duration, updated every 15s.
 *
 * The `status` prop is only used as the SSR / pre-hydration fallback, so the
 * first paint matches what the server rendered and then transitions smoothly.
 */
export function MatchStatusBadge({
  status,
  matchDate,
  displayTime,
  durationHours = 2,
  size = 'sm',
  className = '',
}: MatchStatusBadgeProps) {
  const derived = useDerivedMatchStatus(matchDate, displayTime, durationHours, status)
  const isLive = derived === 'live'

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-sm gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1.5'
  const dotSize = size === 'md' ? 'h-2 w-2' : 'h-1.5 w-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${STATUS_STYLES[derived]} ${sizeClasses} ${className}`}
    >
      {isLive && <span className={`animate-pulse rounded-full bg-current ${dotSize}`} />}
      {STATUS_LABELS[derived]}
    </span>
  )
}
