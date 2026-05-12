'use client'

import { useState, useEffect } from 'react'
import { AdsterraBanner728x90 } from '@/app/components/adsterra/direct/AdsterraBanner728x90'
// import { AdsterraBanner300x250 } from '@/app/components/adsterra/direct/AdsterraBanner300x250'
import { AdsterraBanner320x50 } from '@/app/components/adsterra/direct/AdsterraBanner320x50'

interface Props {
  offset?: number
}

export function MatchDetailAdWrapper({ offset = 0 }: Props) {
  const [adRefreshTick, setAdRefreshTick] = useState(0)

  // Re-render ads every 10 seconds
  useEffect(() => {
    const id = setInterval(() => setAdRefreshTick(t => t + 1), 20000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="hidden lg:block">
        <AdsterraBanner728x90 reinitTrigger={adRefreshTick + offset} />
      </div>
      <div className="lg:hidden flex flex-wrap justify-center gap-0">
        <AdsterraBanner320x50 reinitTrigger={adRefreshTick + offset} />
        <AdsterraBanner320x50 reinitTrigger={adRefreshTick + offset} />
        <AdsterraBanner320x50 reinitTrigger={adRefreshTick + offset} />
      </div>
    </>
  )
}
