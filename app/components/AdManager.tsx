'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    AdProvider?: unknown[]
  }
}

interface AdManagerProps {
  children: React.ReactNode
}

export function AdManager({ children }: AdManagerProps) {
  const pathname = usePathname()
  const scriptsLoadedRef = useRef(false)
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initializeAds = () => {
    // Initialize AdProvider to serve ads
    const initScript = document.createElement('script')
    initScript.textContent = `(AdProvider = window.AdProvider || []).push({"serve": {}});`
    document.body.appendChild(initScript)
  }

  useEffect(() => {
    if (scriptsLoadedRef.current) {
      // Scripts already loaded, just initialize ads
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current)
      }
      initTimerRef.current = setTimeout(() => {
        initializeAds()
      }, 200)
      return
    }

    // Suppress Exoclick script errors
    const errorHandler = (event: ErrorEvent) => {
      if (event.filename?.includes('ad-provider.js')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('error', errorHandler)

    let scriptsToLoad = 0
    let scriptsLoaded = 0

    const onScriptLoad = () => {
      scriptsLoaded++
      if (scriptsLoaded === scriptsToLoad) {
        scriptsLoadedRef.current = true
        // Initialize ads after all scripts load
        setTimeout(() => {
          initializeAds()
        }, 300)
      }
    }

    // Load magsrv.com ad provider (for most ads)
    if (!document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
      scriptsToLoad++
      const magsrvScript = document.createElement('script')
      magsrvScript.async = true
      magsrvScript.type = 'application/javascript'
      magsrvScript.src = 'https://a.magsrv.com/ad-provider.js'
      magsrvScript.onload = onScriptLoad
      magsrvScript.onerror = () => {
        console.log('Exoclick magsrv script failed to load')
        onScriptLoad() // Continue even if one script fails
      }
      document.head.appendChild(magsrvScript)
    }

    // Load pemsrv.com ad provider (for interstitial ads)
    if (!document.querySelector('script[src="https://a.pemsrv.com/ad-provider.js"]')) {
      scriptsToLoad++
      const pemsrvScript = document.createElement('script')
      pemsrvScript.async = true
      pemsrvScript.type = 'application/javascript'
      pemsrvScript.src = 'https://a.pemsrv.com/ad-provider.js'
      pemsrvScript.onload = onScriptLoad
      pemsrvScript.onerror = () => {
        console.log('Exoclick pemsrv script failed to load')
        onScriptLoad() // Continue even if one script fails
      }
      document.head.appendChild(pemsrvScript)
    }

    // If scripts were already present, initialize immediately
    if (scriptsToLoad === 0) {
      scriptsLoadedRef.current = true
      setTimeout(() => {
        initializeAds()
      }, 300)
    }

    // Cleanup error handler after initialization
    setTimeout(() => {
      window.removeEventListener('error', errorHandler)
    }, 2000)

    return () => {
      window.removeEventListener('error', errorHandler)
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current)
      }
    }
  }, [])

  // Re-initialize ads on route change
  useEffect(() => {
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current)
    }
    initTimerRef.current = setTimeout(() => {
      initializeAds()
    }, 300)

    return () => {
      if (initTimerRef.current) {
        clearTimeout(initTimerRef.current)
      }
    }
  }, [pathname])

  return <>{children}</>
}
