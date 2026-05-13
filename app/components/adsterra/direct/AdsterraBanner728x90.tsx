'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const KEY = 'c22ec2a12af103ab3b80567c83bec0c6'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

export function AdsterraBanner728x90({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    { key: KEY, invokeUrl: INVOKE_URL, width: 728, height: 90 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 728, minHeight: 90 }}
    />
  )
}
