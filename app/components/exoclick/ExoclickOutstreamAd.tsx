'use client'
import { useRef } from 'react'
import { useExoClickAd } from '@/hooks/useExoClickAd'

interface ExoclickOutstreamAdProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickOutstreamAd({ className = '', onAdLoadError }: ExoclickOutstreamAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useExoClickAd(
    containerRef,
    { insClassName: 'eas6a97888e37', zoneId: '5923146', blockAdTypes: '0' },
    onAdLoadError
  )
  return <div ref={containerRef} className={className} />
}
