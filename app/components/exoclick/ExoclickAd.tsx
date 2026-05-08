'use client'

import { useEffect, useRef } from 'react'

interface ExoclickAdProps {
  zoneId?: string
  className?: string
  blockedAdIds?: string
}

export function ExoclickAd({ zoneId = '5922060', className = '', blockedAdIds = '31,45,69,27' }: ExoclickAdProps) {
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (scriptLoadedRef.current) return
    scriptLoadedRef.current = true

    // Load the ad provider script
    const script = document.createElement('script')
    script.async = true
    script.type = 'application/javascript'
    script.src = 'https://a.magsrv.com/ad-provider.js'
    document.head.appendChild(script)

    // Initialize the ad
    const initScript = document.createElement('script')
    initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
    document.body.appendChild(initScript)

    // Hide close buttons from Exoclick ads using CSS
    const style = document.createElement('style')
    style.textContent = `
      .eas6a97888e37 [class*="close"],
      .eas6a97888e37 [class*="Close"],
      .eas6a97888e37 [class*="button"][class*="close"],
      .eas6a97888e37 button[aria-label*="close"],
      .eas6a97888e37 button[aria-label*="Close"],
      .eas6a97888e37 .close-btn,
      .eas6a97888e37 .close-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      // Cleanup scripts if needed
    }
  }, [])

  return (
    <div className={className}>
      <ins 
        className={`eas6a97888e37`} 
        data-zoneid={zoneId}
        data-block-ad-types={blockedAdIds}
      />
    </div>
  )
}
