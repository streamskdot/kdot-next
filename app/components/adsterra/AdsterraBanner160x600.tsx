'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner160x600({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: '16673ebaf9725398bd617cac7f3e74c0',
      invokeUrl: 'https://rhubarbambassadorweep.com/16673ebaf9725398bd617cac7f3e74c0/invoke.js',
      width: 160,
      height: 600,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
