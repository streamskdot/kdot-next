'use client'

import { useEffect, useState, useRef } from 'react'
import { AdsterraBanner320x50 } from './direct/AdsterraBanner320x50'

interface Props {
  className?: string
}

export function AdsterraBanner320x50WithRefresh({ className = '' }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisibleRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const wasVisible = isVisibleRef.current
        isVisibleRef.current = entry.isIntersecting
        setIsVisible(entry.isIntersecting)

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

    const intervalId = setInterval(() => {
      if (!document.hidden && isVisible) {
        setRefreshTick(t => t + 1)
      }
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [isVisible])

  return (
    <div ref={containerRef}>
      {shouldLoad && <AdsterraBanner320x50 className={className} reinitTrigger={refreshTick} />}
    </div>
  )
}
