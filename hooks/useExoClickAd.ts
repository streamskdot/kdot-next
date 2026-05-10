'use client'
import { useEffect, RefObject } from 'react'

interface AdConfig {
  insClassName: string
  zoneId: string
  blockAdTypes: string
}

const SCRIPT_SRC = 'https://a.magsrv.com/ad-provider.js'

function destroyAdProvider() {
  // Remove the existing script tag from DOM
  const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
  if (existing) existing.remove()

  // Nuke the window.AdProvider instance and all its internal state
  if ((window as any).AdProvider) {
    delete (window as any).AdProvider
  }
}

function injectAdProvider(onError?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.async = true
    script.type = 'application/javascript'
    script.src = SCRIPT_SRC
    script.onload = () => resolve()
    script.onerror = () => {
      console.log('Exoclick ad-provider.js blocked')
      onError?.()
      resolve() // resolve anyway so we don't hang
    }
    document.head.appendChild(script)
  })
}

export function useExoClickAd(
  containerRef: RefObject<HTMLDivElement | null>,
  config: AdConfig,
  onAdLoadError?: () => void
) {
  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    const run = async () => {
      // 1. Wipe the container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }

      // 2. Destroy old AdProvider instance completely
      destroyAdProvider()

      // 3. Create a brand new <ins> that AdProvider has NEVER seen
      const ins = document.createElement('ins')
      ins.className = config.insClassName
      ins.setAttribute('data-zoneid', config.zoneId)
      ins.setAttribute('data-block-ad-types', config.blockAdTypes)

      if (containerRef.current && !cancelled) {
        containerRef.current.appendChild(ins)
      }

      // 4. Re-inject ad-provider.js from scratch — it will scan the DOM
      //    and find our fresh <ins> with no prior state
      await injectAdProvider(onAdLoadError)

      // 5. Push serve after script is loaded and DOM has settled
      if (!cancelled) {
        setTimeout(() => {
          if (!cancelled) {
            ;(window as any).AdProvider = (window as any).AdProvider || []
            ;(window as any).AdProvider.push({ serve: {} })
          }
        }, 200)
      }
    }

    const errorHandler = (event: ErrorEvent) => {
      if (event.filename?.includes('ad-provider.js')) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
    }
    window.addEventListener('error', errorHandler)

    run()

    return () => {
      cancelled = true
      window.removeEventListener('error', errorHandler)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }) // NO dependency array — fires on every mount
}
