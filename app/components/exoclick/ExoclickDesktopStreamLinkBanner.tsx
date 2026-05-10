'use client'
import { useRef } from 'react'
import { useExoClickAd } from '@/hooks/useExoClickAd'

interface ExoclickDesktopStreamLinkBannerProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickDesktopStreamLinkBanner({ className = '', onAdLoadError }: ExoclickDesktopStreamLinkBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useExoClickAd(
    containerRef,
    { insClassName: 'eas6a97888e2', zoneId: '5923134', blockAdTypes: '0' },
    onAdLoadError
  )
  return <div ref={containerRef} className={className} />
}
