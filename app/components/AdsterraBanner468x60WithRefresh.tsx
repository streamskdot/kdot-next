'use client'

import { useEffect, useState } from 'react'
import { AdsterraBanner468x60 } from './adsterra/direct/AdsterraBanner468x60'

interface Props {
  className?: string
}

export function AdsterraBanner468x60WithRefresh({ className = '' }: Props) {
  const [refreshTick, setRefreshTick] = useState(0)

  // Re-render the banner every 10 seconds on mobile
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  return <AdsterraBanner468x60 className={className} reinitTrigger={refreshTick} />
}
