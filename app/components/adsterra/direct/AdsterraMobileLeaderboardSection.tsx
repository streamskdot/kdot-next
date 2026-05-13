'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner320x50 } from './AdsterraBanner320x50'

/**
 * Mobile-only top leaderboard. 320x50 banner refreshed every 30 seconds.
 */
export function AdsterraMobileLeaderboardSection() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="md:hidden w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex justify-center">
        <AdsterraBanner320x50 reinitTrigger={tick} />
      </div>
    </div>
  )
}
