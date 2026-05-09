'use client'

import { ExoclickSkyscraperAd } from './ExoclickSkyscraperAd'

export function SkyscraperAdSection() {
  return (
    <>
      {/* Left skyscraper ad */}
      <div className="hidden xl:block fixed left-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <ExoclickSkyscraperAd key="skyscraper-left" />
        </div>
      </div>

      {/* Right skyscraper ad */}
      <div className="hidden xl:block fixed right-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <ExoclickSkyscraperAd key="skyscraper-right" />
        </div>
      </div>
    </>
  )
}
