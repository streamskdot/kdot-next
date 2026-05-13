'use client'

import { useEffect, useState, useRef } from 'react'
import { AdsterraBanner320x50 } from './direct/AdsterraBanner320x50'

interface Props {
  className?: string
  offsetSeconds?: number
}

export function AdsterraBanner320x50WithRefreshOffset({ className = '', offsetSeconds = 0 }: Props) {
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
    const refreshInterval = 15000 // 15 seconds

    // Start interval immediately, but apply offset to the first refresh
    const intervalId = setInterval(() => {
      // Only refresh if tab is visible AND ad is in viewport
      if (!document.hidden && isVisible) {
        setRefreshTick(t => t + 1)
      }
    }, refreshInterval)

    // If offset is set, trigger first refresh after offset delay
    if (offsetSeconds > 0) {
      const timeoutId = setTimeout(() => {
        if (!document.hidden && isVisible) {
          setRefreshTick(t => t + 1)
        }
      }, offsetSeconds * 1000)

      return () => {
        clearTimeout(timeoutId)
        clearInterval(intervalId)
      }
    }

    return () => clearInterval(intervalId)
  }, [offsetSeconds, isVisible])

  return (
    <div ref={containerRef}>
      {shouldLoad && <AdsterraBanner320x50 className={className} reinitTrigger={refreshTick} />}
    </div>
  )
}
