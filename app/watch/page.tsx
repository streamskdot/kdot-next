'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Radio } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { StreamPlayer } from '@/app/components/StreamPlayer'
// import { LiveViewerCount } from '@/app/components/LiveViewerCount'
import { WatchBottomPanel } from '@/app/components/WatchBottomPanel'
import { WatchPageActions } from '@/app/components/WatchPageActions'
import { ExoclickOutstreamAd } from '@/app/components/exoclick/ExoclickOutstreamAd'
import { supabase } from '@/lib/supabase'

interface MatchData {
  id: string
  team1: string
  team2: string
  stream_links: any
  status: string
  match_date: string
  display_time: string
  raw_data: any
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

export default function WatchPage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const matchId = searchParams.get('match')
  const n = searchParams.get('n')
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [adExpandCount, setAdExpandCount] = useState(0)

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
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
          {/* Channel name and action buttons */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {streamIndex != null && Number.isFinite(streamIndex) && (
                <div className="inline-flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-zinc-500" />
                  <p className="text-xs text-zinc-500">
                    {sortedLinks[streamIndex]?.source === 'ppv' ? 'Channel 1' : (sortedLinks[streamIndex]?.source === 'yosintv' && streamIndex === 2 ? 'English HD' : `Channel ${streamIndex + 1}`)}
                  </p>
                </div>
              )}
            </div>
            <WatchPageActions matchId={matchId || undefined} />
          </div>

          {/* Player with live viewer count overlay */}
          <div className="relative mb-4">
            {url && (
              <StreamPlayer
                key={url}
                url={url}
                title={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
              />
            )}
            {/* <LiveViewerCount videoId={videoId} /> */}
          </div>

          {/* Alternate links */}
          {otherLinks.length > 1 && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Change Language / Streams below: 
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {otherLinks.map(({ link, source }, index) => {
                  const isActive = link === url
                  const isPPV = source === 'ppv'
                  const isYosintvThird = source === 'yosintv' && index === 2
                  const label = isPPV ? 'Channel 1' : (isYosintvThird ? 'English HD' : `Channel ${index + 1}`)
                  return (
                    <Link
                      key={index}
                      href={`/watch?url=${encodeURIComponent(link)}&match=${matchId}&n=${index}`}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-400'
                          : isPPV
                            ? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 dark:border-amber-500/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:border-amber-500 dark:hover:bg-amber-900/30'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-750'
                      }`}
                    >
                      <Radio className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  )
                })}
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                If this link did not work please try others below
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Bottom Panel */}
      <WatchBottomPanel
        streamName={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
        matchDate={matchData?.match_date}
        onExpand={() => setAdExpandCount(c => c + 1)}
      >
        <ExoclickOutstreamAd reinitTrigger={adExpandCount} />
      </WatchBottomPanel>
    </div>
  )
}
