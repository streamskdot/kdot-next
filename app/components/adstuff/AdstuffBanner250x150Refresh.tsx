'use client'

import { useEffect, useState } from 'react'
import { AdstuffBanner250x150 } from './direct/AdstuffBanner250x150'

interface Props {
  className?: string
}

export function AdstuffBanner250x150WithRefresh({ className = '' }: Props) {
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

  return <AdstuffBanner250x150 key={refreshTick} className={className} reinitTrigger={refreshTick} />
}
