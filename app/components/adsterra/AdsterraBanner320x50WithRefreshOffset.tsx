'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner320x50 } from './direct/AdsterraBanner320x50'

interface Props {
  className?: string
  offsetSeconds?: number
}

export function AdsterraBanner320x50WithRefreshOffset({ className = '', offsetSeconds = 0 }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 15 seconds, but pause when tab is hidden
  // Apply offset to stagger refresh timing
  useEffect(() => {
    const refreshInterval = 15000 // 15 seconds

    // Initial delay based on offset
    const initialDelay = offsetSeconds * 1000

    const timeoutId = setTimeout(() => {
      setRefreshTick(t => t + 1)
      
      // Start the interval after initial delay
      const intervalId = setInterval(() => {
        if (!document.hidden) {
          setRefreshTick(t => t + 1)
        }
      }, refreshInterval)

      return () => clearInterval(intervalId)
    }, initialDelay)

    return () => clearTimeout(timeoutId)
  }, [offsetSeconds])

  return <AdsterraBanner320x50 className={className} reinitTrigger={refreshTick} />
}
