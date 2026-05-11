'use client'

import { useState, useEffect } from 'react'
import { AdsterraBanner728x90 } from '@/app/components/adsterra/direct/AdsterraBanner728x90'
import { AdsterraBanner300x250 } from '@/app/components/adsterra/direct/AdsterraBanner300x250'

interface Props {
  offset?: number
}

export function MatchDetailAdWrapper({ offset = 0 }: Props) {
  const [adRefreshTick, setAdRefreshTick] = useState(0)

  // Re-render ads every 10 seconds
  useEffect(() => {
    const id = setInterval(() => setAdRefreshTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="hidden lg:block">
        <AdsterraBanner728x90 reinitTrigger={adRefreshTick + offset} />
      </div>
      <div className="lg:hidden flex justify-center">
        <AdsterraBanner300x250 reinitTrigger={adRefreshTick + offset} />
      </div>
    </>
  )
}
