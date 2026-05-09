'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Radio, Trophy, Star } from 'lucide-react'
import { ExoclickDialog } from './exoclick'

interface StreamLinksSectionProps {
  streamLinks: Array<{source: string, link: string}> | string[] | null
  status: string
  matchId: string
  showAdDialog?: boolean
}

export function StreamLinksSection({ streamLinks, status, matchId, showAdDialog = true }: StreamLinksSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<{ url: string; index: number } | null>(null)
  const router = useRouter()
  
  // Handle both old string format and new {source, link} object format
  const normalizedLinks = (streamLinks ?? []).map((l, i) => {
    if (typeof l === 'string') {
      return { link: l, source: 'yosintv', index: i }
    }
    return { link: l.link, source: l.source || 'yosintv', index: i }
  })
  const hasLinks = normalizedLinks.length > 0
  const isUpcoming = status === 'upcoming'

  const handleStreamClick = (url: string, index: number) => {
    if (showAdDialog) {
      setSelectedStream({ url, index })
      setDialogOpen(true)
    } else {
      router.push(`/watch?url=${encodeURIComponent(url)}&match=${matchId}&n=${index}`)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Watch Live
          </h2>
        </div>

        {/* Telegram Channel Link */}
        <a
          href="https://t.me/+OpTUPK3X0NwyNmZh"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex items-center gap-3 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 p-4 text-white transition-transform hover:scale-[1.02] hover:shadow-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.11-.04-.16-.05-.05-.12-.03-.17-.02-.07.02-1.14.73-3.2 2.13-.3.21-.57.31-.82.31-.27 0-.53-.14-.77-.27l-.03-.02c-.54-.28-1.15-.6-1.15-1.18 0-.4.22-.62.63-.82l.05-.02c2.38-1.04 3.93-1.72 4.66-2.05.67-.3 1.29-.29 1.68-.17.42.13.76.43.82.84.05.35.12.7.14 1.05z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Join KdotTV Telegram Channel</p>
            <p className="text-sm text-white/80">Get instant match updates and notifications</p>
          </div>
          <ExternalLink className="h-5 w-5" />
        </a>

        {/* Stream Links */}
        {hasLinks ? (
          <div className="space-y-3">
            {normalizedLinks.map(({ link, source, index }) => {
              const isRecommended = source === 'ppv'
              return (
                <button
                  key={index}
                  onClick={() => handleStreamClick(link, index)}
                  className={`relative flex w-full items-center gap-3 rounded-xl border p-4 transition-all ${
                    isRecommended
                      ? 'border-amber-400 bg-linear-to-r from-amber-50 to-yellow-50 hover:border-amber-500 hover:from-amber-100 hover:to-yellow-100 dark:border-amber-500/50 dark:from-amber-900/20 dark:to-yellow-900/20 dark:hover:border-amber-500 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30'
                      : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-750'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-linear-to-r from-amber-400 to-yellow-400 px-2 py-1 shadow-md dark:from-amber-500 dark:to-yellow-500">
                      <Star className="h-3 w-3 fill-white text-white" />
                      <span className="text-xs font-bold text-white">Recommended</span>
                    </div>
                  )}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isRecommended ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <Radio className={`h-5 w-5 ${isRecommended ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium text-zinc-900 dark:text-white ${isRecommended ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                      {isRecommended ? ` Stream Link 1 [HD]` : (index === 1 ? `Stream Link HD ${index + 1} [ENGLISH]` : `Stream Link ${index + 1} (HD)`)}
                    </p>
                  </div>
                  <ExternalLink className={`h-5 w-5 ${isRecommended ? 'text-amber-500' : 'text-zinc-400'}`} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
            <Trophy className="mx-auto h-12 w-12 text-zinc-400 mb-3" />
            <p className="text-lg font-medium text-zinc-900 dark:text-white">
              {isUpcoming ? 'Links will be available when match is about to start' : 'Match Has Ended'}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isUpcoming ? 'Sorry for the delay' : 'No stream links available for this match'}
            </p>
          </div>
        )}
      </div>

      {selectedStream && (
        <ExoclickDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          streamUrl={selectedStream.url}
          matchId={matchId}
          streamIndex={selectedStream.index}
        />
      )}
    </>
  )
}
