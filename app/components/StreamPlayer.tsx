'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface StreamPlayerProps {
  url: string
  title?: string
}

/**
 * Renders a video/stream player in a responsive 16:9 iframe.
 * The `url` is the embedded player URL (e.g. from yosintv / cricfoot wrappers).
 * Kept as a standalone client component so it can be reused on the dedicated
 * /watch page or embedded inline on a match detail page.
 */
export function StreamPlayer({ url, title = 'Live Stream' }: StreamPlayerProps) {
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  // Basic validation: must be absolute http(s) URL.
  const isValid = /^https?:\/\//i.test(url)

  if (!isValid) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-5 w-5" />
          Invalid stream URL
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-sm dark:border-zinc-800">
      {loading && !errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <div className="flex flex-col items-center gap-2 text-sm">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading stream…
          </div>
        </div>
      )}

      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-200">
          <div className="flex flex-col items-center gap-2 px-6 text-center text-sm">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <p className="font-medium">Could not load this stream</p>
            <p className="text-xs text-zinc-400">
              The provider may have blocked embedding. Try another link.
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setErrored(true)
          }}
        />
      )}
    </div>
  )
}
