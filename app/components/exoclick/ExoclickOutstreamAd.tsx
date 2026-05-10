'use client'
import { useRef } from 'react'
import { useExoClickAd } from '@/hooks/useExoClickAd'

interface ExoclickOutstreamAdProps {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function ExoclickOutstreamAd({ className = '', onAdLoadError, reinitTrigger }: ExoclickOutstreamAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useExoClickAd(
    containerRef,
    { insClassName: 'eas6a97888e37', zoneId: '5923146', blockAdTypes: '0' },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
