'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const KEY = '16673ebaf9725398bd617cac7f3e74c0'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

/**
 * Adsterra 160x600 skyscraper rendered directly (no iframe). Refresh by
 * incrementing `reinitTrigger`.
 */
export function AdsterraBanner160x600({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    { key: KEY, invokeUrl: INVOKE_URL, width: 160, height: 600 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 160, minHeight: 600 }}
    />
  )
}
