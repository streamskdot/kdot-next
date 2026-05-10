'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react'

export interface WatchBottomPanelProps {
  streamName?: string
  status?: string
  matchDate?: string
  children?: ReactNode
  expandedContent?: ReactNode
}

export function WatchBottomPanel({
  streamName,
  status,
  matchDate,
  children,
  expandedContent
}: WatchBottomPanelProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [manualCloseTime, setManualCloseTime] = useState<number | null>(null)

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
      }, 100)
    }

    const timer = setInterval(cycle, 45000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // If manually closed, reopen after 30 seconds
  useEffect(() => {
    if (manualCloseTime && !isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(true)
        setManualCloseTime(null)
      }, 30000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [manualCloseTime, isExpanded])

  const handleToggle = () => {
    if (isExpanded) {
      // User is manually closing
      setManualCloseTime(Date.now())
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header Bar - Always Visible */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 shadow-sm transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {calculatedStatus && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                calculatedStatus === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                calculatedStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {calculatedStatus}
              </span>
            )}
            {streamName && (
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {streamName}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-all duration-200"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 min-h-[40vh] max-h-[40vh] overflow-y-auto">
          {expandedContent || children}
        </div>
      )}
    </div>
  )
}
