'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

/**
 * Smart Link / Native Banner — uses the named container div pattern
 * (Adsterra's invoke.js looks for `#container-<key>` to mount into).
 */
export function AdsterraNativeBanner({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: 'e3d2657564ea75009b5dd5b3a20e6a03',
      invokeUrl: 'https://rhubarbambassadorweep.com/e3d2657564ea75009b5dd5b3a20e6a03/invoke.js',
      width: 300,
      height: 250,
      containerId: 'container-e3d2657564ea75009b5dd5b3a20e6a03',
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
