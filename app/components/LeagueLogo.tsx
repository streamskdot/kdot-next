'use client'

import { useState } from 'react'

interface LeagueLogoProps {
  src: string | null | undefined
  alt: string
  className?: string
}

function FootballPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,7 15.5,9.6 14.2,13.7 9.8,13.7 8.5,9.6" />
      <line x1="12" y1="7" x2="12" y2="3.2" />
      <line x1="15.5" y1="9.6" x2="19.1" y2="8.4" />
      <line x1="14.2" y1="13.7" x2="16.6" y2="16.8" />
      <line x1="9.8" y1="13.7" x2="7.4" y2="16.8" />
      <line x1="8.5" y1="9.6" x2="4.9" y2="8.4" />
    </svg>
  )
}

export function LeagueLogo({ src, alt, className = 'h-5 w-5' }: LeagueLogoProps) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <FootballPlaceholder
        className={`${className} text-current opacity-80`}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`${className} rounded object-contain`}
    />
  )
}
