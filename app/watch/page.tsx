import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Radio } from 'lucide-react'
import { Navbar } from '@/app/components/Navbar'
import { StreamPlayer } from '@/app/components/StreamPlayer'
import { LiveViewerCount } from '@/app/components/LiveViewerCount'
import { ShareButton } from '@/app/components/ShareButton'
import { supabase } from '@/lib/supabase'

function BulletinBanner() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Telegram CTA with pulse */}
      <a
        href="https://t.me/+OpTUPK3X0NwyNmZh"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-xl border border-blue-500/50 bg-linear-to-r from-blue-500 to-cyan-500 p-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/50"
      >
        <span className="absolute inset-0 animate-pulse bg-linear-to-r from-blue-500 to-cyan-500 opacity-30" />
        <div className="relative flex items-center gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.11-.04-.16-.05-.05-.12-.03-.17-.02-.07.02-1.14.73-3.2 2.13-.3.21-.57.31-.82.31-.27 0-.53-.14-.77-.27l-.03-.02c-.54-.28-1.15-.6-1.15-1.18 0-.4.22-.62.63-.82l.05-.02c2.38-1.04 3.93-1.72 4.66-2.05.67-.3 1.29-.29 1.68-.17.42.13.76.43.82.84.05.35.12.7.14 1.05z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-white truncate">Telegram ✈️</span>
          </div>
        </div>
      </a>

      {/* WhatsApp CTA with pulse */}
      <a
        href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-xl border border-green-500/50 bg-linear-to-r from-green-500 to-emerald-500 p-2 shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] hover:shadow-green-500/50"
      >
        <span className="absolute inset-0 animate-pulse bg-linear-to-r from-green-500 to-emerald-500 opacity-30" />
        <div className="relative flex items-center gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-bold text-white truncate">WhatsApp 💬</span>
          </div>
        </div>
      </a>
    </div>
  )
}

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

  // Use match ID as video ID for live viewer tracking, fall back to URL if no match
  // If using URL, hash it to create a consistent ID
  const videoId = matchId || (url ? url : '')

  // All stream links for this match so users can switch without going back.
  // Handle both old string format and new {source, link} object format
  const otherLinks: string[] = (matchData?.stream_links as Array<{source: string, link: string}> | string[] | null ?? [])
    .map(l => typeof l === 'string' ? l : l.link)

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
            Back {matchId ? 'to match' : 'to home'}
          </Link>

          {/* Bulletin Banner */}
          <div className="mb-4">
            <BulletinBanner />
          </div>

          {/* Title */}
          {matchData && (
            <div className="mb-4">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
                {matchData.team1Name} vs {matchData.team2Name}
              </h1>
              <div className="mt-2 flex items-center justify-between gap-4">
                {streamIndex != null && Number.isFinite(streamIndex) && (
                  <p className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Radio className="h-4 w-4 text-green-500" />
                    {streamIndex === 1 ? 'ENGLISH HD' : `Stream Link ${streamIndex + 1}`}
                  </p>
                )}
                <div className="ml-auto">
                  <ShareButton />
                </div>
              </div>
            </div>
          )}

          {/* Player with live viewer count overlay */}
          <div className="relative">
            <StreamPlayer
              key={url}
              url={url}
              title={matchData ? `${matchData.team1Name} vs ${matchData.team2Name}` : 'Live Stream'}
            />
            <LiveViewerCount videoId={videoId} />
          </div>

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
                      {index === 1 ? 'ENGLISH HD' : `Channel ${index + 1}`}
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
