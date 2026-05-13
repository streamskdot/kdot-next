'use client'
import { useEffect, RefObject } from 'react'

/**
 * Direct-DOM adstuff ad refresh (no iframe wrapper).
 *
 *   - Reset host, optionally pre-create the named #container-<key> div.
 *   - Append the adstuff script as a child of our host.
 *   - Cache-bust the script URL on each refresh tick (but not on first
 *     mount — some networks anti-fraud-flag heavily cache-busted reqs).
 *   - Serialize all in-flight refreshes via a module-level promise queue
 *     so concurrent mounts don't race.
 */

interface Config {
  scriptUrl: string
  width: number
  height: number
  /** If set, a child div with this id is created before the script runs. */
  containerId?: string
}

let queue: Promise<void> = Promise.resolve()

function enqueue(fn: () => Promise<void>): void {
  queue = queue.then(fn, fn).catch(() => undefined)
}

export function useAdstuffDirectRefresh(
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

      const url = config.scriptUrl

      try {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script')
          script.src = url
          let settled = false
          const done = () => {
            if (settled) return
            settled = true
            // Give the script a tick to mutate the DOM after it evaluates.
            setTimeout(resolve, 100)
          }
          script.onload = done
          script.onerror = (error) => {
            console.warn('[Adstuff] script load failed:', url, error)
            done()
          }
          host.appendChild(script)
          // Safety net so the queue doesn't hang if onload never fires.
          setTimeout(() => {
            if (!settled) {
              console.warn('[Adstuff] script load timeout:', url)
              done()
            }
          }, 4000)
        })
      } catch (error) {
        console.error('[Adstuff] script execution error:', error)
      }
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reinitTrigger])
}
