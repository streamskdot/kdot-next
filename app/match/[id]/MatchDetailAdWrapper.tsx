'use client'

import { useEffect, useState } from 'react'
import { AdSlot728x90, AdSlot320x50 } from '@/app/components/AdSlot'
import { AdsterraBanner320x50 } from '@/app/components/adsterra/direct/AdsterraBanner320x50'
import { AdsterraBanner728x90 } from '@/app/components/adsterra/direct/AdsterraBanner728x90'

export function MatchDetailAdWrapper() {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 15 seconds
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="hidden lg:block">
        <AdsterraBanner728x90 reinitTrigger={refreshTick}/>
      </div>
      <div className="lg:hidden flex flex-wrap justify-center gap-0">
        <AdsterraBanner320x50 reinitTrigger={refreshTick+5} />
        <AdsterraBanner320x50 reinitTrigger={refreshTick+4} />
        <AdsterraBanner320x50 reinitTrigger={refreshTick+1.5} />
      </div>
    </>
  )
}
