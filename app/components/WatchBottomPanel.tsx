'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'

export interface WatchBottomPanelProps {
  streamName?: string
  status?: string
  matchDate?: string
  matchId?: string
  children?: ReactNode
  expandedContent?: ReactNode
  onExpand?: () => void
}

export function WatchBottomPanel({
  streamName,
  status,
  matchDate,
  matchId,
  children,
  expandedContent,
  onExpand
}: WatchBottomPanelProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [manualCloseTime, setManualCloseTime] = useState<number | null>(null)
  const [unlockSecondsLeft, setUnlockSecondsLeft] = useState(30)
  const collapseUnlocked = unlockSecondsLeft <= 0

  // Tick down every second so the user sees a live countdown until the
  // collapse button unlocks (after 30s).
  useEffect(() => {
    if (unlockSecondsLeft <= 0) return
    const t = setTimeout(() => setUnlockSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [unlockSecondsLeft])

  // Calculate status from DB data if matchDate is provided
  const calculatedStatus = matchDate ? (() => {
    const now = new Date()
    const match = new Date(matchDate)
    const diff = match.getTime() - now.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours > 0) return 'UPCOMING'
    if (hours > -5) return 'LIVE' // Assume live for 5 hours after start
    return 'ENDED'
  })() : status

  // Auto-collapse after 45 seconds, then immediately reopen, and repeat cycle
  useEffect(() => {
    const cycle = () => {
      // Close
      setIsExpanded(false)
      // Immediately reopen after 100ms
      setTimeout(() => {
        setIsExpanded(true)
        onExpand?.()
      }, 100)
    }

    const timer = setInterval(cycle, 45000)

    return () => {
      clearInterval(timer)
    }
  }, [onExpand])

  // If manually closed, reopen after 60 seconds (1 minute)
  useEffect(() => {
    if (manualCloseTime && !isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(true)
        onExpand?.()
        setManualCloseTime(null)
      }, 60000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [manualCloseTime, isExpanded, onExpand])

  const handleToggle = () => {
    const next = !isExpanded
    setIsExpanded(next)
    if (next) {
      onExpand?.()
      setManualCloseTime(null)
    } else {
      // Mark manual close so the 1-minute reopen timer arms.
      setManualCloseTime(Date.now())
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header Bar - Always Visible */}
      <div className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-zinc-200/70 dark:border-zinc-800/70 backdrop-blur-sm">
        {/* Big back button — always navigates to the match detail page so
            users return to the match page even when /watch was opened in a
            fresh tab (where history.back() would do nothing useful). */}
        <button
          onClick={() => {
            if (matchId) router.push(`/match/${matchId}`)
            else router.back()
          }}
          className="group flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/30 transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/40 active:scale-95"
          aria-label="Back to match page"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {calculatedStatus && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                calculatedStatus === 'LIVE' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                calculatedStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {calculatedStatus === 'LIVE' && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
                  </span>
                )}
                {calculatedStatus}
              </span>
            )}
          </div>
          {streamName && (
            <p className="text-sm font-semibold leading-tight text-zinc-900 dark:text-white truncate">
              {streamName}
            </p>
          )}
        </div>

        {collapseUnlocked ? (
          <button
            onClick={handleToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
            aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div
            className="flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl border border-zinc-200/70 bg-zinc-50 px-2 text-[11px] font-semibold tabular-nums text-zinc-400 dark:border-zinc-800/70 dark:bg-zinc-900 dark:text-zinc-500"
            aria-live="polite"
            title={`Available in ${unlockSecondsLeft}s`}
          >
            {unlockSecondsLeft}s
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <div
        className="overflow-y-auto transition-all duration-300"
        style={{
          minHeight: isExpanded ? '40vh' : '0',
          maxHeight: isExpanded ? '40vh' : '0',
          padding: isExpanded ? '1rem' : '0',
          overflow: isExpanded ? 'auto' : 'hidden',
          visibility: isExpanded ? 'visible' : 'hidden',
        }}
      >
        {expandedContent || children}
      </div>
    </div>
  )
}
