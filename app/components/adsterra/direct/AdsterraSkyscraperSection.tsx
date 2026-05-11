'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner160x600 } from './AdsterraBanner160x600'

/**
 * Layout-level skyscraper ad section: a fixed 160x600 banner on each
 * side of the viewport (xl screens only). Both banners refresh every
 * 30 seconds via the direct-DOM Adsterra hook.
 */
export function AdsterraSkyscraperSection() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* Left skyscraper */}
      <div className="hidden xl:block fixed left-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          <AdsterraBanner160x600 reinitTrigger={tick} />
        </div>
      </div>

      {/* Right skyscraper */}
      <div className="hidden xl:block fixed right-0 top-[114px] h-[calc(100vh-114px)] w-40 bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-200/50 dark:border-zinc-800/50 z-40">
        <div className="h-full flex items-center justify-center py-4">
          {/* +1 staggers the right-side refresh so it doesn't fire in the
              exact same tick as the left one (the hook serializes anyway,
              but staggering avoids a brief simultaneous reflow). */}
          <AdsterraBanner160x600 reinitTrigger={tick + 1} />
        </div>
      </div>
    </>
  )
}
