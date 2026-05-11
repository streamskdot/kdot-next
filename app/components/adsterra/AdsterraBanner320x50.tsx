'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner320x50({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: '8219f1246aef7b7461ab58ec27dad391',
      invokeUrl: 'https://rhubarbambassadorweep.com/8219f1246aef7b7461ab58ec27dad391/invoke.js',
      width: 320,
      height: 50,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
