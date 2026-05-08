'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    AdProvider?: any[]
  }
}

interface ExoclickInterstitialAdProps {
  className?: string
  key?: string | number
}

export function ExoclickInterstitialAd({ className = '', key, onAdLoadError }: ExoclickInterstitialAdProps & { onAdLoadError?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return

    console.log('ExoclickInterstitialAd: Initializing...')

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
    if (document.querySelector('script[src="https://a.pemsrv.com/ad-provider.js"]')) {
      console.log('ExoclickInterstitialAd: Script already loaded, initializing ad')
      // Script already exists, just initialize the ad
      const initScript = document.createElement('script')
      initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
      document.body.appendChild(initScript)
    } else {
      console.log('ExoclickInterstitialAd: Loading script...')
      // Load the ad provider script
      const script = document.createElement('script')
      script.async = true
      script.type = 'application/javascript'
      script.src = 'https://a.pemsrv.com/ad-provider.js'

      // Handle script loading errors (blocked by privacy protection)
      script.onerror = () => {
        console.log('Exoclick interstitial script blocked by privacy protection')
        if (onAdLoadError) {
          onAdLoadError()
        }
      }

      script.onload = () => {
        console.log('ExoclickInterstitialAd: Script loaded successfully')
        const initScript = document.createElement('script')
        initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
        document.body.appendChild(initScript)
        console.log('ExoclickInterstitialAd: Ad initialized')

        // Debug: Check if AdProvider is available
        setTimeout(() => {
          console.log('ExoclickInterstitialAd: AdProvider available?', typeof window.AdProvider !== 'undefined')
          console.log('ExoclickInterstitialAd: Window.AdProvider:', window.AdProvider)

          // Check for elements with exoclick-trigger class
          const triggerElements = document.querySelectorAll('.exoclick-trigger')
          console.log('ExoclickInterstitialAd: Found trigger elements:', triggerElements.length)
        }, 1000)
      }

      document.head.appendChild(script)
    }

    initializedRef.current = true

    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [key, onAdLoadError])

  return (
    <div ref={containerRef} className={className}>
      <ins
        className="eas6a97888e33"
        data-zoneid="5922170"
        data-block-ad-types="0"
      />
    </div>
  )
}
