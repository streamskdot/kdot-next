'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner320x50 } from './direct/AdsterraBanner320x50'

interface Props {
  className?: string
}

export function AdsterraBanner320x50WithRefresh({ className = '' }: Props) {
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

  return <AdsterraBanner320x50 className={className} reinitTrigger={refreshTick} />
}
