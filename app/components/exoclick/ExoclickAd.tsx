'use client'

import { useEffect, useRef } from 'react'

interface ExoclickAdProps {
  zoneId?: string
  className?: string
  blockedAdIds?: string
  key?: string | number
}

export function ExoclickAd({ zoneId = '5922060', className = '', blockedAdIds = '31,45,69,27', key }: ExoclickAdProps) {
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
      document.head.appendChild(script)

      // Initialize the ad after script loads
      script.onload = () => {
        const initScript = document.createElement('script')
        initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
        document.body.appendChild(initScript)
      }
    }

    // Hide close buttons from Exoclick ads using CSS
    const style = document.createElement('style')
    style.textContent = `
      .eas6a97888e37 [class*="close"],
      .eas6a97888e37 [class*="Close"],
      .eas6a97888e37 .exo_close,
      [class*="exo_close"],
      .eas6a97888e37 [class*="button"][class*="close"],
      .eas6a97888e37 button[aria-label*="close"],
      .eas6a97888e37 button[aria-label*="Close"],
      .eas6a97888e37 .close-btn,
      .eas6a97888e37 .close-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `
    document.head.appendChild(style)

    initializedRef.current = true

    // Manually trigger Exoclick ad animation after dialog is painted
    const triggerAdAnimation = () => {
      if (!containerRef.current) return

      // Force a reflow by reading the element's properties
      void containerRef.current.offsetHeight
      void containerRef.current.offsetWidth

      // Find and trigger the Exoclick effect animation
      setTimeout(() => {
        const effectElements = containerRef.current?.querySelectorAll('[class*="_effect"]') || []
        effectElements.forEach((effectEl) => {
          effectEl.classList.add('exo_wrapper_show')
        })

        // Also make CTA wrapper visible
        const ctaWrappers = containerRef.current?.querySelectorAll('[class*="_cta_wrapper"]') || []
        ctaWrappers.forEach((ctaEl) => {
          ;(ctaEl as HTMLElement).style.display = 'flex'
        })

        // Manually trigger video playback
        const videos = containerRef.current?.querySelectorAll('video') || []
        videos.forEach((video) => {
          const videoEl = video as HTMLVideoElement
          if (videoEl.paused) {
            videoEl.play().catch((err) => {
              console.log('Video autoplay failed:', err)
            })
          }
        })
      }, 500)
    }

    // Use requestAnimationFrame to ensure the dialog is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(triggerAdAnimation, 300)
      })
    })

    // Cleanup
    return () => {
      window.removeEventListener('error', errorHandler)
    }
  }, [key])

  return (
    <div ref={containerRef} className={className}>
      <ins
        className={`eas6a97888e37`}
        data-zoneid={zoneId}
        data-block-ad-types={blockedAdIds}
      />
    </div>
  )
}
