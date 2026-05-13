'use client'

import { useEffect, useState, useRef } from 'react'
import { AdsterraBanner468x60 } from './AdsterraBanner468x60'

interface Props {
  className?: string
}

export function AdsterraBanner468x60WithRefresh({ className = '' }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Intersection Observer to detect when ad is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const wasVisible = isVisibleRef.current
        isVisibleRef.current = entry.isIntersecting
        setIsVisible(entry.isIntersecting)
        
        // Load script when ad enters viewport for first time
        if (!wasVisible && entry.isIntersecting && !shouldLoad) {
          setShouldLoad(true)
          if (!document.hidden) {
            setRefreshTick(t => t + 1)
          }
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [shouldLoad])

  useEffect(() => {
    const refreshInterval = 10000 // 10 seconds

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
      {shouldLoad && <AdsterraBanner468x60 key={refreshTick} className={className} reinitTrigger={refreshTick} />}
    </div>
  )
}
