'use client'
import { useRef } from 'react'
import { useAdsterraDirectRefresh } from '@/hooks/useAdsterraDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const KEY = '8219f1246aef7b7461ab58ec27dad391'
const INVOKE_URL = `https://rhubarbambassadorweep.com/${KEY}/invoke.js`

export function AdsterraBanner320x50({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsterraDirectRefresh(
    containerRef,
    { key: KEY, invokeUrl: INVOKE_URL, width: 320, height: 50 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: 320, minHeight: 50 }}
    />
  )
}
