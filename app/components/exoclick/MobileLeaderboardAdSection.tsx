'use client'

import { ExoclickMobileLeaderboardAd } from './ExoclickMobileLeaderboardAd'

export function MobileLeaderboardAdSection() {
  return (
    <div className="md:hidden w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
        <ExoclickMobileLeaderboardAd className="w-full flex justify-center" />
      </div>
    </div>
  )
}
