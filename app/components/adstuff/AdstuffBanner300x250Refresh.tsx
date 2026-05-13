'use client'
import { useEffect, useState, useRef } from 'react'
import { AdstuffBanner300x250 } from './direct/AdstuffBanner300x250'

interface Props {
  className?: string
}

/**
 * Wrapper that refreshes the 300x250 banner every 15 seconds.
 * Pauses when tab is hidden or when ad is not in viewport.
 */
export function AdstuffBanner300x250WithRefresh({ className = '' }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Intersection Observer to detect when ad is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsVisible(entry.isIntersecting)
        
        // Load script when ad enters viewport for first time
        if (entry.isIntersecting && !shouldLoad) {
          setShouldLoad(true)
          if (!document.hidden) {
            setRefreshTick(t => t + 1)
          }
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the ad is visible
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [shouldLoad])

  useEffect(() => {
    const refreshInterval = 15000

    const intervalId = setInterval(() => {
      // Only refresh if tab is visible AND ad is in viewport
      if (!document.hidden && isVisible) {
        setRefreshTick(t => t + 1)
      }
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [isVisible])

  return (
    <div ref={containerRef}>
      {shouldLoad && <AdstuffBanner300x250 key={refreshTick} className={className} reinitTrigger={refreshTick} />}
    </div>
  )
}
