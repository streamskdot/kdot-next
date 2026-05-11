'use client'
import { useEffect, RefObject } from 'react'

interface AdsteraBannerConfig {
  key: string
  invokeUrl: string
  width: number
  height: number
  containerId?: string
}

export function useAdsteraBanner(
  containerRef: RefObject<HTMLDivElement | null>,
  config: AdsteraBannerConfig,
  onAdLoadError?: () => void,
  reinitTrigger?: number
) {
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    const run = async () => {
      if (!containerRef.current || cancelled) return

      // 1. Clear container
      containerRef.current.innerHTML = ''

      // 2. Remove any existing invoke.js for this key to avoid duplicates
      const existingScript = document.querySelector(
        `script[src="${config.invokeUrl}"]`
      )
      if (existingScript) existingScript.remove()

      // 3. Set atOptions on window — Adsterra reads this synchronously
      //    when invoke.js executes. Multiple banners on a page race here,
      //    but invoke.js immediately captures the value into a closure,
      //    so injecting atOptions + script back-to-back per banner works.
      ;(window as unknown as { atOptions: unknown }).atOptions = {
        key: config.key,
        format: 'iframe',
        height: config.height,
        width: config.width,
        params: {},
      }

      // 4. For Smart Link / Native Banner: create the container div the
      //    invoke.js script expects to find by id.
      if (config.containerId) {
        const div = document.createElement('div')
        div.id = config.containerId
        containerRef.current.appendChild(div)
      }

      // 5. Inject the invoke.js script fresh
      await new Promise<void>((resolve) => {
        const script = document.createElement('script')
        script.async = true
        script.setAttribute('data-cfasync', 'false')
        script.src = config.invokeUrl
        script.onload = () => resolve()
        script.onerror = () => {
          console.warn(`Adsterra script blocked: ${config.invokeUrl}`)
          onAdLoadError?.()
          resolve()
        }
        containerRef.current?.appendChild(script)
      })

      // 6. Dispatch synthetic events so visibility checks pass — same fix
      //    used for ExoClick outstream slots.
      if (!cancelled) {
        setTimeout(() => {
          if (cancelled) return
          window.dispatchEvent(new Event('scroll'))
          window.dispatchEvent(new Event('resize'))
          document.dispatchEvent(new Event('visibilitychange'))
        }, 300)
      }
    }

    run()

    return () => {
      cancelled = true
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinitTrigger])
}
