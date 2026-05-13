'use client'
import { AdstuffBanner300x250 } from './direct/AdstuffBanner300x250'

interface Props {
  className?: string
}

/**
 * Simple wrapper for the 300x250 banner. No refresh logic.
 */
export function AdstuffBanner300x250WithRefresh({ className = '' }: Props) {
  return <AdstuffBanner300x250 className={className} />
}
