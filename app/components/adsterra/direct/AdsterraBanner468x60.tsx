'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const KEY = '7077010ec8194988c50b2be130a48d12'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

export function AdsterraBanner468x60({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    { key: KEY, invokeUrl: INVOKE_URL, width: 468, height: 60 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 468, minHeight: 60 }}
    />
  )
}
