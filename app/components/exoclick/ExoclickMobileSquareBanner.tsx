'use client'
import { useRef } from 'react'
import { useExoClickAd } from '@/hooks/useExoClickAd'

interface ExoclickMobileSquareBannerProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickMobileSquareBanner({ className = '', onAdLoadError }: ExoclickMobileSquareBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useExoClickAd(
    containerRef,
    { insClassName: 'eas6a97888e10', zoneId: '5923132', blockAdTypes: '0' },
    onAdLoadError
  )
  return <div ref={containerRef} className={className} />
}
