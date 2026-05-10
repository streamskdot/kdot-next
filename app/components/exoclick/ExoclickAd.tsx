'use client'

import { useEffect, useRef } from 'react'

interface ExoclickAdProps {
  zoneId?: string
  className?: string
  blockedAdIds?: string
  key?: string | number
}

export function ExoclickAd({ zoneId = '5922060', className = '', blockedAdIds = '31,45,69,27', key, onAdLoadError }: ExoclickAdProps & { onAdLoadError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    // Suppress Exoclick script errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.filename?.includes('ad-provider.js')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('error', errorHandler)

    // Check if script is already loaded
    if (document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
      // Script already exists, just initialize the ad
      const initScript = document.createElement('script')
      initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
      document.body.appendChild(initScript)
    } else {
      // Load the ad provider script
      const script = document.createElement('script')
      script.async = true
      script.type = 'application/javascript'
      script.src = 'https://a.magsrv.com/ad-provider.js'

      // Handle script loading errors (blocked by privacy protection)
      script.onerror = () => {
        console.log('Exoclick script blocked by privacy protection')
        if (onAdLoadError) {
          onAdLoadError()
        }
      }

      document.head.appendChild(script)

      // Initialize the ad after script loads
      script.onload = () => {
        const initScript = document.createElement('script')
        initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
        document.body.appendChild(initScript)
      }
    }

    initializedRef.current = true

    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [onAdLoadError])

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="eas6a97888e37"
        data-zoneid={zoneId}
        data-block-ad-types={blockedAdIds}
      />
    </div>
  )
}
