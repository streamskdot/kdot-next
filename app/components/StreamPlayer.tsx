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
    <div className="group relative">
      {/* Outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[1.25rem] bg-linear-to-br from-red-500/40 via-red-600/30 to-red-900/40 opacity-80 blur-md transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Gradient border frame */}
      <div className="relative rounded-2xl bg-linear-to-br from-red-500 via-red-700 to-red-950 p-0.5 shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)]">
        {/* Inner bezel */}
        <div className="relative overflow-hidden rounded-[14px] bg-black ring-1 ring-white/5">
          {/* Corner accents (TV-frame look) */}
          <span aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 h-5 w-5 rounded-tl-[14px] border-l-2 border-t-2 border-red-400/90" />
          <span aria-hidden className="pointer-events-none absolute right-0 top-0 z-20 h-5 w-5 rounded-tr-[14px] border-r-2 border-t-2 border-red-400/90" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-20 h-5 w-5 rounded-bl-[14px] border-b-2 border-l-2 border-red-400/90" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-20 h-5 w-5 rounded-br-[14px] border-b-2 border-r-2 border-red-400/90" />

          {/* Floating LIVE chip */}
          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/50 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            On Air
          </div>

          {/* 16:9 stage */}
          <div className="relative aspect-video w-full bg-black">
            {/* Scanline / vignette overlay */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"
            />

            {loading && !errored && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 text-white">
                <div className="flex flex-col items-center gap-3 text-sm">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                  </div>
                  <span className="font-medium tracking-wide text-zinc-200">Tuning in…</span>
                </div>
              </div>
            )}

            {/* kdotTV watermark — sits over the provider's own URL overlay. */}
            {!loading && !errored && (
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[80%] z-20 -translate-x-1/2 -translate-y-1/2 select-none"
              >
                <div className="flex min-w-60 items-center justify-center gap-3 rounded-xl bg-black/90 px-8 py-2.5 shadow-xl ring-1 ring-white/15 sm:min-w-75 sm:px-10 sm:py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-sm font-black text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] sm:h-8 sm:w-8 sm:text-base">
                    K
                  </span>
                  <span className="text-xl font-black tracking-wide text-white sm:text-2xl">
                    kdot<span className="text-red-400">TV</span>
                  </span>
                </div>
              </div>
            )}

            {errored ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-200">
                <div className="flex flex-col items-center gap-2 px-6 text-center text-sm">
                  <AlertTriangle className="h-7 w-7 text-red-400" />
                  <p className="font-semibold">Signal Lost</p>
                  <p className="text-xs text-zinc-400">
                    The provider may have blocked embedding. Try another link below.
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
        </div>
      </div>

      {/* Bottom pedestal / channel bar */}
      <div className="relative mx-auto mt-2 flex h-1.5 w-11/12 items-center justify-center rounded-b-xl bg-linear-to-r from-transparent via-red-600/70 to-transparent" />
    </div>
  )
}
