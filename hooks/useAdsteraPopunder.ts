'use client'
import { useCallback } from 'react'

const POPUNDER_SRC =
  'https://pl29414521.profitablecpmratenetwork.com/dd/fa/86/ddfa86cc4beb4769dfbb3d0ec98d64ae.js'

/**
 * Adsterra popunder arms itself when the script loads and fires on the next
 * user gesture. If we keep the script around it will only fire once and then
 * go dormant. To get one popunder per "View Ad" click we:
 *   1. Remove the previous script + any internal flags Adsterra set on window
 *   2. Re-inject a fresh script synchronously inside the click handler so the
 *      browser attributes the upcoming popunder to this user gesture
 *
 * Browsers still enforce their own per-gesture popup limits, but per-click
 * re-injection is the only reliable way to get repeated impressions.
 */
function clearAdsterraInternals() {
  try {
    const w = window as unknown as Record<string, unknown>
    for (const k of Object.keys(w)) {
      if (/^(_pop|popns|popMagic|adsterra)/i.test(k)) {
        delete w[k]
      }
    }
  } catch {
    // ignore — some keys are non-configurable
  }
}

export function useAdsteraPopunder() {
  // Stable identity so these can be safely used in effect deps.
  const triggerPopunder = useCallback(() => {
    if (typeof window === 'undefined') return

    // Tear down any previous popunder script so it can re-arm fresh.
    const existing = document.querySelectorAll(`script[src="${POPUNDER_SRC}"]`)
    existing.forEach((s) => s.remove())

    clearAdsterraInternals()

    const script = document.createElement('script')
    script.src = POPUNDER_SRC
    script.async = true
    // data-cfasync=false helps when Cloudflare Rocket Loader is in play
    script.setAttribute('data-cfasync', 'false')
    document.head.appendChild(script)
  }, [])

  /**
   * Remove any armed popunder script and wipe its window-level flags so
   * subsequent clicks anywhere in the page do NOT trigger a popunder.
   */
  const disarmPopunder = useCallback(() => {
    if (typeof window === 'undefined') return
    const existing = document.querySelectorAll(`script[src="${POPUNDER_SRC}"]`)
    existing.forEach((s) => s.remove())
    clearAdsterraInternals()
  }, [])

  return { triggerPopunder, disarmPopunder }
}
