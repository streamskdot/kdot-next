import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Radio } from 'lucide-react'
import { Navbar } from '@/app/components/Navbar'
import { StreamPlayer } from '@/app/components/StreamPlayer'
import { MatchTimer, MatchStatusBadge } from '@/app/components/MatchTimer'
import { supabase } from '@/lib/supabase'

interface WatchPageProps {
  searchParams: Promise<{
    url?: string
    match?: string
    n?: string
  }>
}

async function getMatchLite(id: string) {
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

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const { url, match: matchId, n } = await searchParams

  if (!url) notFound()

  const matchData = matchId ? await getMatchLite(matchId) : null
  const streamIndex = n ? Number(n) : null
  const backHref = matchId ? `/match/${matchId}` : '/'

  // All stream links for this match so users can switch without going back.
  const otherLinks: string[] = (matchData?.stream_links as string[] | null) ?? []

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {/* Back link */}
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back {matchData ? 'to match' : 'to home'}
          </Link>

          {/* Title */}
          {matchData && (
            <div className="mb-4">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                {matchData.team1Name} vs {matchData.team2Name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <MatchStatusBadge
                  status={matchData.status}
                  matchDate={matchData.match_date}
                  displayTime={matchData.display_time}
                  durationHours={Number(
                    (matchData.raw_data as { duration?: number } | null)?.duration ?? 2,
                  )}
                  size="md"
                />
                {streamIndex != null && Number.isFinite(streamIndex) && (
                  <p className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Radio className="h-4 w-4 text-green-500" />
                    Stream Link {streamIndex + 1} (HD)
                  </p>
                )}
                <MatchTimer
                  status={matchData.status}
                  matchDate={matchData.match_date}
                  displayTime={matchData.display_time}
                  durationHours={Number(
                    (matchData.raw_data as { duration?: number } | null)?.duration ?? 2,
                  )}
                  size="md"
                />
              </div>
            </div>
          )}

          {/* Player */}
          <StreamPlayer
            key={url}
            url={url}
            title={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
          />

          {/* Alternate links */}
          {otherLinks.length > 1 && (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Change Language / Streams below: 
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {otherLinks.map((link, index) => {
                  const isActive = link === url
                  return (
                    <Link
                      key={index}
                      href={`/watch?url=${encodeURIComponent(link)}&match=${matchId}&n=${index}`}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-950/40 dark:text-green-400'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-750'
                      }`}
                    >
                      <Radio className="h-3.5 w-3.5" />
                      Link {index + 1}
                    </Link>
                  )
                })}
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                If this link did not work please try others below
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
            Stream provided by third parties. KdotStreams does not host any video content.
          </p>
        </div>
      </main>
    </div>
  )
}
