'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner728x90 } from './AdsterraBanner728x90'

/**
 * Desktop-only top leaderboard. Two 728x90 banners side-by-side
 * (stacked on smaller desktops where they don't fit). Refreshed every
 * 30 seconds.
 *
 * NOTE: Both banners use the same Adsterra zone key, so only one will
 * reliably render at a time (Adsterra stores per-zone state in
 * window.atAsyncContainers[<key>]).
 */
export function AdsterraLeaderboardSection() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden md:block w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-center">
          <AdsterraBanner728x90 reinitTrigger={tick} />
          <AdsterraBanner728x90 reinitTrigger={tick + 1} />
        </div>
      </div>
    </div>
  )
}
