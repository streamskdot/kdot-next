'use client'
import { usePathname } from 'next/navigation'
import { ExoclickLeaderboardAd } from './ExoclickLeaderboardAd'

interface ExoclickLeaderboardAdWithKeyProps {
  className?: string
  onAdLoadError?: () => void
}

export function ExoclickLeaderboardAdWithKey({ className = '', onAdLoadError }: ExoclickLeaderboardAdWithKeyProps) {
  const pathname = usePathname()
  return <ExoclickLeaderboardAd key={`leaderboard-${pathname}`} className={className} onAdLoadError={onAdLoadError} />
}
