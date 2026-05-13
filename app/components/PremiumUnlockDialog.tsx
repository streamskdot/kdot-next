'use client'

import { useEffect, useState } from 'react'
import { Check, Crown, Lock, Loader2, Play } from 'lucide-react'
import { useHilltopPopunder } from '@/hooks/useHilltopPopunder'

interface PremiumUnlockDialogProps {
  open: boolean
  onClose: () => void
  watchUrl: string
  requiredAdViews?: number
  skipDialog?: boolean
  onStandardWatch: () => void
  streamName?: string
}

export function PremiumUnlockDialog({
  open,
  onClose,
  watchUrl,
  requiredAdViews = 2,
  skipDialog = false,
  onStandardWatch,
  streamName,
}: PremiumUnlockDialogProps) {
  const [adViewCount, setAdViewCount] = useState(0)
  const [prevOpen, setPrevOpen] = useState(open)
  const { armPopunder, disarmPopunder } = useHilltopPopunder(open && !skipDialog && adViewCount < requiredAdViews)

  // Reset counter every time the dialog closes (React-recommended derived-state pattern).
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) setAdViewCount(0)
  }

  // Bypass path: open immediately and close, render nothing.
  useEffect(() => {
    if (!open) return
    if (!skipDialog) return
    if (typeof window !== 'undefined' && watchUrl) {
      window.location.href = watchUrl
    }
    onClose()
  }, [open, skipDialog, watchUrl, onClose])

  const unlocked = adViewCount >= requiredAdViews
  const remaining = Math.max(0, requiredAdViews - adViewCount)

  // Pre-arm the popunder while the dialog is open and we still owe ads.
  // HilltopAds' script attaches its click listener AFTER it loads (async),
  // so arming on the click itself misses that click. Loading ahead of time
  // ensures the listener is live by the time the user clicks View Ad.
  // We re-arm on every adViewCount change so a fresh popunder is queued
  // for each remaining click. Once unlocked, we stop arming so the Watch
  // button click never fires a popunder.
  useEffect(() => {
    if (!open || skipDialog) return
    if (adViewCount >= requiredAdViews) {
      disarmPopunder()
      return
    }
    armPopunder()
    // Cleanup runs when dialog closes, count changes, or component unmounts.
    // This guarantees no armed popunder script survives outside the dialog,
    // so clicks on the Premium Link / Watch / anywhere else don't fire one.
    return () => {
      disarmPopunder()
    }
  }, [open, skipDialog, adViewCount, requiredAdViews, armPopunder, disarmPopunder])

  if (!open || skipDialog) return null

  const handleViewAd = () => {
    // Re-arm the popunder script on each click to ensure it fires
    armPopunder()
    // The popunder gate (in useHilltopPopunder) allows window.open through
    // for any click whose target is inside [data-popunder-allow]. The
    // View Ad button below carries that attribute, so the vendor's
    // click handler fires window.open normally on this click.
    setAdViewCount((c) => c + 1)
  }

  const handleWatchPremium = () => {
    if (!unlocked) return
    if (typeof window !== 'undefined' && watchUrl) {
      window.location.href = watchUrl
    }
  }

  const handleStandard = () => {
    onStandardWatch()
    onClose()
  }

  const subtitle =
    adViewCount === 0
      ? "Click 'View Ad' twice below to unlock. Thank you for supporting us — your support keeps this service free. 🙏"
      : !unlocked
      ? remaining === 1
        ? 'Almost there! One more ad view to go...'
        : `Almost there! ${remaining} more ad views to go...`
      : "You're all set! Enjoy the match. Thank you for your support 🙏"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      // NOTE: backdrop click does NOT close the dialog. The HilltopAds
      // popunder script dispatches synthetic clicks whose target lands
      // on this backdrop element, which used to fire onClose
      // unintentionally. Users dismiss the dialog via the explicit
      // "No Thanks, watch in Standard HD" button further down.
      onClick={(e) => {
        if (process.env.NODE_ENV !== 'production') {
          // Forensic log so we can see what the popunder dispatched.
          console.log(
            '[dialog] backdrop click (ignored)',
            'target=', (e.target as Element).tagName,
            'currentTarget=', (e.currentTarget as Element).tagName,
            'isTrusted=', (e.nativeEvent as MouseEvent).isTrusted,
            'sameTarget=', e.target === e.currentTarget,
          )
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Animated gold shimmer bar */}
        <div className="relative h-1 w-full overflow-hidden bg-amber-200/40 dark:bg-amber-900/30">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_2.2s_linear_infinite] bg-linear-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 ${
                unlocked
                  ? 'bg-linear-to-br from-amber-400 to-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.55)]'
                  : 'bg-zinc-100 dark:bg-zinc-800'
              }`}
            >
              {unlocked ? (
                <Crown className="h-8 w-8 text-zinc-900" />
              ) : (
                <Lock className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-4 text-center text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Watch in Crystal Clear 2160p
          </h2>
          {streamName && (
            <p className="mt-1 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
              {streamName}
            </p>
          )}

          {/* Subtitle (transitions per stage) */}
          <p className="mt-3 min-h-12 text-center text-sm leading-relaxed text-zinc-600 transition-all duration-500 dark:text-zinc-300">
            {subtitle}
          </p>

          {/* Progress circles */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {Array.from({ length: requiredAdViews }).map((_, i) => {
              const filled = i < adViewCount
              return (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    filled
                      ? 'border-amber-400 bg-linear-to-br from-amber-400 to-yellow-500 shadow-[0_0_14px_rgba(251,191,36,0.6)]'
                      : 'border-zinc-300 bg-transparent dark:border-zinc-700'
                  }`}
                >
                  {filled && <Check className="h-4 w-4 text-zinc-900" strokeWidth={3} />}
                </div>
              )
            })}
          </div>

          {/* View Ad button — disappears once unlocked.
              Bind to onMouseDown (and onTouchStart for mobile): both fire
              BEFORE the `click` event that Adsterra's document listener
              swallows, so the counter advances reliably even when the
              popunder fires. */}
          {!unlocked && (
            <button
              data-popunder-allow="1"
              onMouseDown={handleViewAd}
              onTouchStart={handleViewAd}
              className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              View Ad ({remaining} remaining)
            </button>
          )}

          {/* Watch Premium button */}
          <button
            onClick={handleWatchPremium}
            disabled={!unlocked}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-500 ${
              unlocked
                ? 'bg-linear-to-r from-amber-400 to-yellow-500 text-zinc-900 shadow-lg shadow-amber-500/40 hover:from-amber-300 hover:to-yellow-400 animate-pulse'
                : 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
            }`}
          >
            {unlocked ? (
              <>
                <Play className="h-4 w-4 fill-current" />
                Watch Match in 2160p (2K)
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Watch Match in 2160p (2K)
              </>
            )}
          </button>

          {/* OR divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              or
            </span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Standard HD button */}
          <button
            onClick={handleStandard}
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm font-medium text-zinc-600 transition-all duration-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            No Thanks, I want to watch in Standard HD
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  )
}
