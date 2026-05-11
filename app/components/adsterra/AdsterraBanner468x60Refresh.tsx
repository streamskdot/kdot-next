'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner468x60 } from './AdsterraBanner468x60'

interface Props {
  className?: string
}

export function AdsterraBanner468x60WithRefresh({ className = '' }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 15 seconds, but pause when tab is hidden
  useEffect(() => {
    const refreshInterval = 15000 // 15 seconds

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        setRefreshTick(t => t + 1)
      }
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [])

  return <AdsterraBanner468x60 key={refreshTick} className={className} reinitTrigger={refreshTick} />
}
