'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  /** Increment to force a refresh of the ad without iframe re-mount. */
  reinitTrigger?: number
}

const KEY = 'e3d2657564ea75009b5dd5b3a20e6a03'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

/**
 * Adsterra Native Banner rendered directly into the DOM (no iframe).
 * Refreshable via `reinitTrigger` thanks to the document.write shim in
 * `useAdsterraDirectRefresh` — keeps the ad in the host frame to preserve
 * full CPM while still allowing impression-boost refreshes.
 */
export function AdsterraNativeBanner({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    {
      key: KEY,
      invokeUrl: INVOKE_URL,
      width: 300,
      height: 250,
      containerId: `container-${KEY}`,
    },
    reinitTrigger,
  )
  return <div ref={containerRef} className={className} />
}
