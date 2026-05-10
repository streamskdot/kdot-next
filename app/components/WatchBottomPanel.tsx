'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface WatchBottomPanelProps {
  streamName?: string
  status?: string
  children?: ReactNode
  expandedContent?: ReactNode
}

export function WatchBottomPanel({
  streamName,
  status,
  children,
  expandedContent
}: WatchBottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Auto-expand every 1 minute when collapsed
  useEffect(() => {
    if (!isExpanded) {
      const expandTimer = setInterval(() => {
        setIsExpanded(true)
      }, 60000)

      return () => {
        clearInterval(expandTimer)
      }
    }
  }, [isExpanded])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
      {/* Header Bar - Always Visible */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {status && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                status === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {status}
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
