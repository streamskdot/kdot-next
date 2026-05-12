'use client'

import React from 'react'

/**
 * Generic ad placeholder. Reserves the exact pixel footprint of a future ad
 * unit (HilltopAds, PropellerAds, etc.) so that swapping in a real network
 * later does not cause layout shift.
 *
 * Render any of the convenience components (AdSlot728x90, AdSlot320x50, …)
 * or pass `width` / `height` directly for custom sizes.
 *
 * The placeholder intentionally has NO third-party script. It is a static
 * <div> only — there is zero risk of redirects, popunders, or malvertising
 * until a real ad tag is dropped into `children`.
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

export function AdSlot({ width, height, label, className = '', children }: AdSlotProps) {
  const style: React.CSSProperties = {
    width,
    height,
    minHeight: typeof height === 'number' ? height : undefined,
  }

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-zinc-100/60 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600 ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children ?? (label ? <span>{label}</span> : null)}
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
  return (
    <div className="hidden md:block w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-center">
          <AdSlot728x90 />
          <AdSlot728x90 />
        </div>
      </div>
    </div>
  )
}

export function AdMobileLeaderboardSection() {
  return (
    <div className="md:hidden w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex justify-center">
        <AdSlot320x50 />
      </div>
    </div>
  )
}

export function AdSkyscraperSection() {
  return (
    <>
      <div className="hidden xl:block fixed left-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <AdSlot160x600 />
        </div>
      </div>
      <div className="hidden xl:block fixed right-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <AdSlot160x600 />
        </div>
      </div>
    </>
  )
}
