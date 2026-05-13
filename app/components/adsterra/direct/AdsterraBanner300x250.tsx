'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const KEY = '5413dd830828ab151edb4c84975f02ff'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

/**
 * Adsterra 300x250 banner rendered directly (no iframe). Refresh by
 * incrementing `reinitTrigger`.
 */
export function AdsterraBanner300x250({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    { key: KEY, invokeUrl: INVOKE_URL, width: 300, height: 250 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 300, minHeight: 250 }}
    />
  )
}
