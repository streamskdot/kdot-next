'use client'

import { useEffect, useRef } from 'react'

interface ExoclickMobileLeaderboardAdProps {
  className?: string
}

// Global flag to track if the main script has been loaded
let scriptLoaded = false

export function ExoclickMobileLeaderboardAd({ className = '', onAdLoadError }: ExoclickMobileLeaderboardAdProps & { onAdLoadError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Suppress Exoclick script errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.filename?.includes('ad-provider.js')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('error', errorHandler)

    const initAd = () => {
      const initScript = document.createElement('script')
      initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
      document.body.appendChild(initScript)
    }

    // Check if script is already loaded
    if (document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]') || scriptLoaded) {
      // Script already exists, just initialize the ad
      initAd()
    } else {
      // Load the ad provider script
      const script = document.createElement('script')
      script.async = true
      script.type = 'application/javascript'
      script.src = 'https://a.magsrv.com/ad-provider.js'

      // Handle script loading errors (blocked by privacy protection)
      script.onerror = () => {
        console.log('Exoclick mobile leaderboard script blocked by privacy protection')
        if (onAdLoadError) {
          onAdLoadError()
        }
      }

      document.head.appendChild(script)
      scriptLoaded = true

      // Initialize the ad after script loads
      script.onload = initAd
    }

    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [onAdLoadError])

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="eas6a97888e10"
        data-zoneid="5923092"
        data-block-ad-types="31,45,69,27,101"
      />
    </div>
  )
}
