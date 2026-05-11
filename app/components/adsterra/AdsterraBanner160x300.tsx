'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner160x300({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: '86108302f3c24bcf2096d1efa9af3e34',
      invokeUrl: 'https://rhubarbambassadorweep.com/86108302f3c24bcf2096d1efa9af3e34/invoke.js',
      width: 160,
      height: 300,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
