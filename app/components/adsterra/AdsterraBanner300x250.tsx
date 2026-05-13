'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner300x250({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: '5413dd830828ab151edb4c84975f02ff',
      invokeUrl: 'https://rhubarbambassadorweep.com/5413dd830828ab151edb4c84975f02ff/invoke.js',
      width: 300,
      height: 250,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
