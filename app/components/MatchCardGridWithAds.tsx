'use client'

import React from 'react'
import { ExoclickLeaderboardAd } from './exoclick/ExoclickLeaderboardAd'
import { ExoclickMobileMatchCardBanner } from './exoclick/ExoclickMobileMatchCardBanner'
import { Children } from 'react'

interface MatchCardGridWithAdsProps {
  children: React.ReactNode
  className?: string
}

export function MatchCardGridWithAds({ children, className = '' }: MatchCardGridWithAdsProps) {
  const childArray = Children.toArray(children)

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {/* Insert mobile banner after every 2 match cards on mobile */}
            {(index + 1) % 2 === 0 && index !== childArray.length - 1 && (
              <div className="lg:hidden col-span-full flex items-center justify-center py-2">
                <ExoclickMobileMatchCardBanner key={`mobile-banner-${index}`} />
              </div>
            )}
            {/* Insert banner after every 3 match cards on desktop */}
            {(index + 1) % 3 === 0 && index !== childArray.length - 1 && (
              <div className="hidden lg:block lg:col-span-full flex items-center justify-center py-2">
                <ExoclickLeaderboardAd key={`banner-${index}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Pop under banner if there are 3 or more match cards */}
      {childArray.length >= 3 && (
        <div className="hidden lg:block mt-4 flex justify-center">
          <ExoclickLeaderboardAd key="pop-under-banner" />
        </div>
      )}
    </div>
  )
}
