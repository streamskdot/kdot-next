'use client'

import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { Radio, Star, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { StreamPlayer } from '@/app/components/StreamPlayer'
// import { LiveViewerCount } from '@/app/components/LiveViewerCount'
import { WatchBottomPanel } from '@/app/components/WatchBottomPanel'
import { WatchPageActions } from '@/app/components/WatchPageActions'
// import { AdSlot728x90 } from '@/app/components/AdSlot'
import { AdsterraBanner320x50 } from '@/app/components/adsterra/direct/AdsterraBanner320x50'
import { AdsterraBanner728x90 } from '@/app/components/adsterra/direct/AdsterraBanner728x90'
import { Navbar } from '@/app/components/Navbar'
import { PremiumUnlockDialog } from '@/app/components/PremiumUnlockDialog'
import { supabase } from '@/lib/supabase'

interface MatchData {
  id: string
  team1: string
  team2: string
  stream_links: Array<{ source: string; link: string }> | string[] | null
  status: string
  match_date: string
  display_time: string
  raw_data: Record<string, unknown> | null
  team1Name?: string
  team2Name?: string
}

async function getMatchLite(id: string): Promise<MatchData | null> {
  const { data } = await supabase
    .from('matches')
    .select('id, team1, team2, stream_links, status, match_date, display_time, raw_data')
    .eq('id', id)
    .single()

  if (!data) return null

  const { data: teams } = await supabase
    .from('teams')
    .select('slug, name')
    .in('slug', [data.team1, data.team2])

  const map = new Map((teams ?? []).map(t => [t.slug, t.name]))
  return {
    ...data,
    team1Name: map.get(data.team1) || data.team1,
    team2Name: map.get(data.team2) || data.team2,
  }
}

export default function WatchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const matchId = searchParams.get('match')
  const n = searchParams.get('n')
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false)
  const [premiumWatchUrl, setPremiumWatchUrl] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 5 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 12000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!url) {
      notFound()
      return
    }

    if (matchId) {
      getMatchLite(matchId).then(setMatchData)
    }
  }, [url, matchId])

  const streamIndex = n ? Number(n) : null

  // Use match ID as video ID for live viewer tracking, fall back to URL if no match
  // If using URL, hash it to create a consistent ID
  // const videoId = matchId || (url ? url : '')

  // All stream links for this match so users can switch without going back.
  // Handle both old string format and new {source, link} object format
  const normalizedLinks = (matchData?.stream_links as Array<{source: string, link: string}> | string[] | null ?? [])
    .map((l, i) => {
      if (typeof l === 'string') {
        return { link: l, source: 'yosintv', originalIndex: i }
      }
      return { link: l.link, source: l.source || 'yosintv', originalIndex: i }
    })
  // Sort to put PPV/source links first
  const sortedLinks = [...normalizedLinks].sort((a, b) => {
    if (a.source === 'ppv' && b.source !== 'ppv') return -1
    if (a.source !== 'ppv' && b.source === 'ppv') return 1
    return 0
  })
  const otherLinks = sortedLinks

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar shown on tablet & desktop only (hidden on mobile, where the
          bottom panel handles nav). Using `md:contents` ensures the wrapper
          doesn't form its own containing block on desktop, so the inner
          `sticky top-0` <nav> sticks against the page scroll instead of
          getting trapped inside an element the size of the navbar itself. */}
      <div className="hidden md:contents">
        <Navbar />
      </div>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
          {/* Channel name and action buttons */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 min-w-0 items-center gap-3">
              {/* Desktop back button — mobile gets the equivalent button in
                  the bottom panel, so this is hidden below md. */}
              <button
                type="button"
                onClick={() => {
                  if (matchId) router.push(`/match/${matchId}`)
                  else router.back()
                }}
                className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-red-600 text-white shadow-sm shadow-red-500/30 transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-md active:scale-95"
                aria-label="Back to match page"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {(() => {
                const current = (streamIndex != null && Number.isFinite(streamIndex)
                  ? normalizedLinks.find(l => l.originalIndex === streamIndex)
                  : undefined)
                  ?? normalizedLinks.find(l => l.link === url)
                if (!current) return null
                const isPPV = current.source === 'ppv'
                const isEnglish = current.source === 'yosintv' && current.originalIndex === 1
                const label = isPPV ? 'Premium [2160p]' : (isEnglish ? 'English' : `Channel ${current.originalIndex + 1}`)
                return (
                  <div className="inline-flex items-center gap-2">
                    {isPPV ? (
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ) : (
                      <Radio className="h-3.5 w-3.5 animate-pulse text-zinc-500" />
                    )}
                    <p className={`text-xs font-medium ${isPPV ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                      {label}
                    </p>
                  </div>
                )
              })()}
            </div>
            <WatchPageActions matchId={matchId || undefined} />
          </div>

          {/* Player with live viewer count overlay */}
          <div className="relative mb-4">
            {url && (() => {
              // Determine whether the currently playing stream is the
              // Premium (PPV) channel so the player can suppress the
              // kdotTV watermark and red translucent banner overlay.
              const currentStream = (streamIndex != null && Number.isFinite(streamIndex)
                ? normalizedLinks.find(l => l.originalIndex === streamIndex)
                : undefined)
                ?? normalizedLinks.find(l => l.link === url)
              const isPremiumStream = currentStream?.source === 'ppv'
              return (
                <StreamPlayer
                  key={url}
                  url={url}
                  title={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
                  isPremium={isPremiumStream}
                />
              )
            })()}
            {/* <LiveViewerCount videoId={videoId} /> */}
          </div>

          {/* Desktop-only below-player ad row: 2x 728x90 + 1x 468x60.
              Hidden on mobile/tablet to avoid horizontal overflow.
              Refreshed every 25s via direct-DOM hook. */}
          <div className="hidden lg:flex flex-col items-center gap-3 mb-4">
            <AdsterraBanner728x90 />
          </div>

          {/* Alternate links */}
          {otherLinks.length > 1 && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Change Language / Streams below: 
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {otherLinks.map(({ link, source, originalIndex }) => {
                  const isActive = streamIndex != null && Number.isFinite(streamIndex)
                    ? originalIndex === streamIndex
                    : link === url
                  const isPPV = source === 'ppv'
                  const isEnglish = source === 'yosintv' && originalIndex === 1
                  const label = isPPV ? 'Premium' : (isEnglish ? 'English' : `Channel ${originalIndex + 1}`)
                  const href = `/watch?url=${encodeURIComponent(link)}&match=${matchId}&n=${originalIndex}`
                  const className = `relative flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-400'
                      : isPPV
                        ? 'border-amber-400 bg-linear-to-r from-amber-50 to-yellow-50 text-amber-700 shadow-sm shadow-amber-200 hover:border-amber-500 hover:from-amber-100 hover:to-yellow-100 dark:border-amber-500/60 dark:from-amber-900/20 dark:to-yellow-900/20 dark:text-amber-300 dark:shadow-none dark:hover:border-amber-500 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-750'
                  }`
                  const inner = (
                    <>
                      {isPPV ? (
                        <Star className={`h-3.5 w-3.5 ${isActive ? '' : 'fill-amber-500 text-amber-500'}`} />
                      ) : (
                        <Radio className="h-3.5 w-3.5" />
                      )}
                      {label}
                    </>
                  )
                  if (isPPV) {
                    return (
                      <button
                        key={originalIndex}
                        type="button"
                        onClick={() => {
                          setPremiumWatchUrl(href)
                          setPremiumDialogOpen(true)
                        }}
                        className={className}
                      >
                        {inner}
                      </button>
                    )
                  }
                  return (
                    <Link key={originalIndex} href={href} className={className}>
                      {inner}
                    </Link>
                  )
                })}
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                If this link did not work please try others below
              </p>
            {/* Desktop 728x90 ad */}
            <div className="flex items-center justify-center">
              <AdsterraBanner728x90 />
            </div>

            </div>
            
          )}

        </div>
      </main>

      {/* Bottom Panel */}
      <WatchBottomPanel
        streamName={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
        matchDate={matchData?.match_date}
        matchId={matchId || undefined}
      >
        <div className="flex flex-col items-center gap-3 pb-4">
          <AdsterraBanner320x50 reinitTrigger={refreshTick+5} />
          <AdsterraBanner320x50 reinitTrigger={refreshTick+7} />
          <AdsterraBanner320x50 reinitTrigger={refreshTick+8} />
          <AdsterraBanner320x50 reinitTrigger={refreshTick+5} />
          <AdsterraBanner320x50 reinitTrigger={refreshTick+6} />
        </div>
      </WatchBottomPanel>

      <PremiumUnlockDialog
        open={premiumDialogOpen}
        onClose={() => setPremiumDialogOpen(false)}
        watchUrl={premiumWatchUrl}
        requiredAdViews={2}
        skipDialog={false}
        onStandardWatch={() => setPremiumDialogOpen(false)}
        streamName={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : undefined}
      />
    </div>
  )
}
