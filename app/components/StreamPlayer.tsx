'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface StreamPlayerProps {
  url: string
  title?: string
}

/**
 * Animated TV static / noise canvas.
 * A small off-screen canvas is drawn each frame and scaled up
 * via CSS with `image-rendering: pixelated` for a retro CRT look.
 */
function TVStatic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const buf = imageData.data

      for (let i = 0; i < buf.length; i += 4) {
        const v = Math.random() * 255
        buf[i] = v     // R
        buf[i + 1] = v // G
        buf[i + 2] = v // B
        buf[i + 3] = 255 // A
      }

      ctx.putImageData(imageData, 0, 0)
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={180}
      className="absolute inset-0 h-full w-full opacity-70"
      style={{ imageRendering: 'pixelated' }}
    />
  )
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
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
                {/* Animated TV static noise */}
                <TVStatic />

                {/* Scanline overlay */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 opacity-25"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 2px)',
                  }}
                />

                {/* Vignette */}
                <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />

                {/* Centre status text */}
                <div className="relative z-30 flex flex-col items-center gap-3">
                  {/* Pulsing ring */}
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/20" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold tracking-wide text-white">
                      Connecting
                      <span className="inline-block w-6 text-left">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
                        <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
                      </span>
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                      Establishing stream
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* kdotTV watermark — sits over the provider's own URL overlay. */}
            {!loading && !errored && (
              <div
                aria-hidden
                data-kdotv-watermark
                className="pointer-events-none absolute left-1/2 top-[80%] z-20 -translate-x-1/2 -translate-y-1/2 select-none"
              >
                {/* Desktop positioning override */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @media (min-width: 640px) {
                      [data-kdotv-watermark] {
                        top: calc(80% + 30px) !important;
                      }
                    }
                  `
                }} />
                <div className="flex min-w-60 items-center justify-center gap-3 rounded-xl bg-black px-8 py-2.5 shadow-xl ring-1 ring-white/15 sm:min-w-75 sm:px-10 sm:py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-sm font-black text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] sm:h-8 sm:w-8 sm:text-base">
                    K
                  </span>
                  <span className="text-xl font-black tracking-wide text-white sm:text-2xl">
                    kdot<span className="text-red-400">TV</span>
                  </span>
                </div>
              </div>
            )}

            {/* Blurred line above center */}
            {!loading && !errored && (
              <div
                aria-hidden
                data-blurred-line
                className="pointer-events-none absolute left-0 right-0 z-20 select-none overflow-hidden h-[45px] sm:h-[80px]"
                style={{
                  top: 'calc(50% - 70px)',
                  width: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.3) 20%, rgba(239,68,68,0.5) 50%, rgba(239,68,68,0.3) 80%, transparent)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.4), inset 0 0 10px rgba(239,68,68,0.2)',
                  borderLeft: '1px solid rgba(239,68,68,0.3)',
                  borderRight: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                {/* Desktop positioning override */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @media (min-width: 640px) {
                      [data-blurred-line] {
                        top: calc(50% - 125px) !important;
                      }
                    }
                  `
                }} />
                {/* Animated scanline effect */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, rgba(239,68,68,0.5), transparent)',
                    animation: 'scanline 3s ease-in-out infinite',
                  }}
                />
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
                id="kdotv-video-player"
                src={url}
                title={title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen; gyroscope; accelerometer"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
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
