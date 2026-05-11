'use client'
import { useEffect, RefObject } from 'react'

/**
 * Direct-DOM Adsterra ad refresh (no iframe wrapper).
 *
 *   - Reset host, optionally pre-create the named #container-<key> div.
 *   - Set window.atOptions for the upcoming script execution.
 *   - Append invoke.js as a child of our host so the script's
 *     document.currentScript.parentNode resolves to our container.
 *   - Cache-bust the script URL on each refresh tick (but not on first
 *     mount — some networks anti-fraud-flag heavily cache-busted reqs).
 *   - Serialize all in-flight refreshes via a module-level promise queue
 *     so concurrent mounts don't race on the shared window.atOptions.
 */

interface Config {
  key: string
  invokeUrl: string
  width: number
  height: number
  /** If set, a child div with this id is created before the script runs. */
  containerId?: string
}

let queue: Promise<void> = Promise.resolve()

function enqueue(fn: () => Promise<void>): void {
  queue = queue.then(fn, fn).catch(() => undefined)
}

export function useAdsterraDirectRefresh(
  containerRef: RefObject<HTMLDivElement | null>,
  config: Config,
  reinitTrigger?: number,
) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return

    let cancelled = false
    const host = containerRef.current

    enqueue(async () => {
      if (cancelled || !host.isConnected) return

      // Reset host & build named container div if requested.
      host.innerHTML = ''
      if (config.containerId) {
        const inner = document.createElement('div')
        inner.id = config.containerId
        host.appendChild(inner)
      }

      // Set atOptions on window — invoke.js reads this synchronously.
      ;(window as unknown as { atOptions: unknown }).atOptions = {
        key: config.key,
        format: 'iframe',
        height: config.height,
        width: config.width,
        params: {},
      }

      const url =
        reinitTrigger && reinitTrigger > 0
          ? `${config.invokeUrl}${config.invokeUrl.includes('?') ? '&' : '?'}_r=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : config.invokeUrl

      await new Promise<void>((resolve) => {
        const script = document.createElement('script')
        script.async = false
        script.setAttribute('data-cfasync', 'false')
        script.src = url
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          // Give invoke.js a tick to mutate the DOM after it evaluates.
          setTimeout(resolve, 100)
        }
        script.onload = done
        script.onerror = () => {
          console.warn('[Adsterra] invoke.js load failed:', url)
          done()
        }
        host.appendChild(script)
        // Safety net so the queue doesn't hang if onload never fires.
        setTimeout(done, 4000)
      })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinitTrigger])
}
