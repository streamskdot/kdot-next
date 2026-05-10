'use client'
import { useRef } from 'react'
import { useExoClickAd } from '@/hooks/useExoClickAd'

interface ExoclickMobileMatchCardBannerProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickMobileMatchCardBanner({ className = '', onAdLoadError }: ExoclickMobileMatchCardBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useExoClickAd(
    containerRef,
    { insClassName: 'eas6a97888e10', zoneId: '5923096', blockAdTypes: '0' },
    onAdLoadError
  )
  return <div ref={containerRef} className={className} />
}
