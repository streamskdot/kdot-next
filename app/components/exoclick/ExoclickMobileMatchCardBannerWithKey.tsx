'use client'
import { usePathname } from 'next/navigation'
import { ExoclickMobileMatchCardBanner } from './ExoclickMobileMatchCardBanner'

interface ExoclickMobileMatchCardBannerWithKeyProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickMobileMatchCardBannerWithKey({ className = '', onAdLoadError }: ExoclickMobileMatchCardBannerWithKeyProps) {
  const pathname = usePathname()
  return <ExoclickMobileMatchCardBanner key={`mobile-banner-${pathname}`} className={className} onAdLoadError={onAdLoadError} />
}
