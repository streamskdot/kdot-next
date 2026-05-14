'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, ArrowLeft, Bell, Shield, Zap, MessageCircle } from 'lucide-react'

function StayUpdatedBanner() {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 p-6 shadow-lg dark:border-amber-800/50 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-amber-900/30 mb-4 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-amber-100/50 via-transparent to-orange-100/50 dark:from-amber-800/20 dark:via-transparent dark:to-orange-800/20" />
      
      <div className="relative">
        {/* Header with icon */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-linear-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent dark:from-amber-200 dark:to-orange-300">
              Stay with KdotTV
            </h3>
            <p className="text-xs font-medium text-amber-600/80 dark:text-amber-400/80 uppercase tracking-wider">
              Never miss a match
            </p>
          </div>
        </div>
        
        {/* Social buttons with animated borders */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Telegram Button */}
          <a
            href="https://t.me/+OpTUPK3X0NwyNmZh"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 p-1 shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-500/50"
          >
            <div className="relative h-full rounded-xl bg-linear-to-br from-blue-600 to-cyan-600 p-4 transition-all group-hover:from-blue-500 group-hover:to-cyan-500">
              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-white">Telegram</span>
                  <span className="block text-[10px] text-white/80">Join Channel</span>
                </div>
              </div>
            </div>
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 p-1 shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-green-500/50"
          >
            <div className="relative h-full rounded-xl bg-linear-to-br from-green-600 to-emerald-600 p-4 transition-all group-hover:from-green-500 group-hover:to-emerald-500">
              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-white">WhatsApp</span>
                  <span className="block text-[10px] text-white/80">Join Group</span>
                </div>
              </div>
            </div>
          </a>
        </div>
        
        {/* Message with icons */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-white/50 p-3 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
              <span className="font-semibold">Platform Updates:</span> We occasionally update our infrastructure to ensure the best streaming experience.
            </p>
          </div>
          
          <div className="flex items-start gap-3 rounded-xl bg-white/50 p-3 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
              <span className="font-semibold">Real-time Alerts:</span> Get instant notifications about new domains and fresh match links.
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

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
        <StayUpdatedBanner />
        {expandedContent || children}
      </div>
    </div>
  )
}
