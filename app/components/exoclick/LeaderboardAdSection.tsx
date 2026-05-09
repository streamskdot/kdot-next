'use client'

import { ExoclickMatchCardBanner } from './ExoclickMatchCardBanner'

export function LeaderboardAdSection() {
  return (
    <div className="hidden md:block w-full bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3">
        {/* Two match card banners - single row on large desktop, stacked on tablet/smaller desktop */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-center">
          <ExoclickMatchCardBanner
            className="w-full flex justify-center"
            key="matchcard-1"
          />
          <ExoclickMatchCardBanner
            className="w-full flex justify-center"
            key="matchcard-2"
          />
        </div>
      </div>
    </div>
  )
}
