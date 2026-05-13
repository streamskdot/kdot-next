'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import { AdsterraBanner160x600 } from './adsterra/direct/AdsterraBanner160x600'
import { AdsterraBanner728x90 } from './adsterra/direct/AdsterraBanner728x90'
import { AdsterraBanner320x50 } from './adsterra/direct/AdsterraBanner320x50'

/**
 * Generic ad placeholder. Reserves the exact pixel footprint of a future ad
 * unit (HilltopAds, PropellerAds, etc.) so that swapping in a real network
 * later does not cause layout shift.
 *
 * Render any of the convenience components (AdSlot728x90, AdSlot320x50, …)
 * or pass `width` / `height` directly for custom sizes.
 *
 * When no real ad markup (`children`) is provided, the slot renders a
 * responsive Kdot TV branded promo banner urging users to join Telegram
 * and WhatsApp for live match links and updates.
 */

interface AdSlotProps {
  width: number | string
  height: number | string
  /** Optional label shown faintly inside the placeholder (debug only). */
  label?: string
  className?: string
  /** Real ad markup goes here when you wire up a network. */
  children?: React.ReactNode
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.697.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function KdotPromo({ width, height }: { width: number | string; height: number | string }) {
  const wNum = typeof width === 'number' ? width : 0
  const hNum = typeof height === 'number' ? height : 0
  const isVertical = hNum > 0 && wNum > 0 && hNum > wNum * 0.8
  const isCompact = !isVertical && (hNum <= 60 || wNum <= 320)

  const shimmer = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2.5s_infinite]" />
    </div>
  )

  const glow = (
    <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_30%_30%,rgba(239,68,68,0.25),transparent_60%)] animate-pulse" />
  )

  if (isVertical) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden rounded-md bg-linear-to-b from-zinc-800 via-zinc-900 to-red-950/50 dark:from-zinc-900 dark:via-zinc-950 dark:to-red-950/40 p-2 text-center">
        {glow}
        {shimmer}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-bold text-white tracking-tight">
              kdot<span className="text-red-500">TV</span>
            </span>
            <div className="h-0.5 w-10 bg-linear-to-r from-transparent via-red-500 to-transparent rounded-full" />
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-300 max-w-32.5">
            Never miss a match.<br />Get live links & instant updates.
          </p>
          <div className="flex flex-col gap-2 w-full mt-1">
            <a
              href="https://t.me/+OpTUPK3X0NwyNmZh"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-1.5 rounded-lg bg-sky-500/20 px-2 py-2 text-[11px] font-semibold text-sky-300 transition-all hover:bg-sky-500/30 hover:scale-105"
            >
              <TelegramIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              Join Telegram
            </a>
            <a
              href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-1.5 rounded-lg bg-green-500/20 px-2 py-2 text-[11px] font-semibold text-green-300 transition-all hover:bg-green-500/30 hover:scale-105"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
              Join WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center w-full h-full overflow-hidden rounded-md bg-linear-to-r from-zinc-800 via-zinc-900 to-red-950/40 dark:from-zinc-900 dark:via-zinc-950 dark:to-red-950/30 ${isCompact ? 'justify-between px-2' : 'justify-between px-3'}`}>
      {glow}
      {shimmer}
      <div className="relative z-10 flex items-center gap-2">
        <span className={`font-bold text-white whitespace-nowrap tracking-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>
          kdot<span className="text-red-500">TV</span>
        </span>
        {!isCompact && (
          <span className="hidden sm:inline text-[10px] text-zinc-400 border-l border-zinc-700 pl-2 ml-0.5">
            Live Match Links & Updates
          </span>
        )}
      </div>
      <div className="relative z-10 flex items-center gap-1.5">
        <a
          href="https://t.me/+OpTUPK3X0NwyNmZh"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1 rounded-md bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-400 transition-all hover:bg-sky-500/25 hover:scale-105"
        >
          <TelegramIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          {!isCompact && <span className="hidden sm:inline">Telegram</span>}
        </a>
        <a
          href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-[10px] font-semibold text-green-400 transition-all hover:bg-green-500/25 hover:scale-105"
        >
          <WhatsAppIcon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          {!isCompact && <span className="hidden sm:inline">WhatsApp</span>}
        </a>
      </div>
    </div>
  )
}

export function AdSlot({ width, height, className = '', children }: AdSlotProps) {
  const style: React.CSSProperties = {
    width,
    height,
    minHeight: typeof height === 'number' ? height : undefined,
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={style}
      aria-hidden={children ? 'true' : 'false'}
    >
      {children ?? <KdotPromo width={width} height={height} />}
    </div>
  )
}

// Convenience presets matching the previous Adsterra slot dimensions.
type PresetProps = Omit<AdSlotProps, 'width' | 'height'>

export const AdSlot728x90 = (p: PresetProps) => (
  <AdSlot width={728} height={90} label="Ad 728x90" {...p} />
)
export const AdSlot468x60 = (p: PresetProps) => (
  <AdSlot width={468} height={60} label="Ad 468x60" {...p} />
)
export const AdSlot320x50 = (p: PresetProps) => (
  <AdSlot width={320} height={50} label="Ad 320x50" {...p} />
)
export const AdSlot300x250 = (p: PresetProps) => (
  <AdSlot width={300} height={250} label="Ad 300x250" {...p} />
)
export const AdSlot160x600 = (p: PresetProps) => (
  <AdSlot width={160} height={600} label="Ad 160x600" {...p} />
)
export const AdSlotNative = (p: PresetProps) => (
  <AdSlot width="100%" height={250} label="Native Ad" {...p} />
)

// Layout-level sections (replace the previous Adsterra*Section components).

export function AdLeaderboardSection() {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 20 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 20000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden md:block w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-center">
          <AdsterraBanner728x90 reinitTrigger={refreshTick} />
          <AdsterraBanner728x90 reinitTrigger={refreshTick} />
        </div>
      </div>
    </div>
  )
}

export function AdMobileLeaderboardSection() {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 7 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 7000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="md:hidden w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex justify-center">
        <AdsterraBanner320x50 reinitTrigger={refreshTick} />
      </div>
    </div>
  )
}

export function AdSkyscraperSection() {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 20 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 20000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="hidden xl:block fixed left-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <AdsterraBanner160x600 reinitTrigger={refreshTick} />
        </div>
      </div>
      <div className="hidden xl:block fixed right-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <AdsterraBanner160x600 reinitTrigger={refreshTick} />
        </div>
      </div>
    </>
  )
}
