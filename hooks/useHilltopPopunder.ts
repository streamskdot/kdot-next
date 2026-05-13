'use client'
import { useCallback, useEffect } from 'react'

const POPUNDER_SRC =
  '//crookedagreement.com/ciDm9n6Hb.2x5/liSbW/Q/9cNJzsAczcO/DBYQ5dNTyZ0P3/MRDyMk4_N/ztAWxa'

/**
 * HilltopAds popunder loader.
 *
 * Architecture:
 *   - armPopunder() injects the vendor script. The script attaches a
 *     click listener to `document` and fires `window.open(adUrl)` on the
 *     next user click anywhere on the page.
 *   - To make sure ONLY clicks on the View Ad button trigger a popunder,
 *     we install a capture-phase listener on document that, for any
 *     event whose target is NOT inside a `[data-popunder-allow]`
 *     element, temporarily replaces window.open with a noop for ~150ms.
 *     150ms covers any setTimeout(0) / rAF deferral the popunder script
 *     might do.
 *   - View Ad clicks pass through the gate untouched, so the popunder's
 *     window.open runs normally and a popunder opens.
 */

function clearVendorInternals() {
  try {
    const w = window as unknown as Record<string, unknown>
    for (const k of Object.keys(w)) {
      if (/^(_pop|popns|popMagic|hilltop|zbc)/i.test(k)) {
        delete w[k]
      }
    }
  } catch {
    // Some keys are non-configurable; ignore.
  }
}

export function useHilltopPopunder(active: boolean) {
  // Install / uninstall the marker-based click gate for the dialog's
  // lifetime. The gate is registered BEFORE any armPopunder() call so it
  // sits ahead of the vendor's listener in document-capture order.
  useEffect(() => {
    if (!active || typeof window === 'undefined') return

    const gate = (e: Event) => {
      const target = e.target as Element | null
      // Allow: click target is the View Ad button (or a child of it).
      if (target && typeof target.closest === 'function' && target.closest('[data-popunder-allow]')) {
        return
      }
      // Block: neuter window.open for ~150ms so the vendor's click handler
      // (and any setTimeout(0) it defers to) hits a noop and no popup opens.
      const orig = window.open
      window.open = function () {
        return null
      } as typeof window.open
      setTimeout(() => {
        window.open = orig
      }, 150)
    }

    document.addEventListener('click', gate, { capture: true })
    document.addEventListener('mousedown', gate, { capture: true })
    document.addEventListener('touchstart', gate, { capture: true })

    return () => {
      document.removeEventListener('click', gate, { capture: true })
      document.removeEventListener('mousedown', gate, { capture: true })
      document.removeEventListener('touchstart', gate, { capture: true })
    }
  }, [active])

  /** Inject (or swap to) a popunder script. */
  const armPopunder = useCallback(() => {
    if (typeof window === 'undefined') return

    // Tear down any previously armed instance so it re-arms fresh.
    document
      .querySelectorAll('script[data-hilltop-popunder="1"]')
      .forEach((s) => s.remove())
    clearVendorInternals()

    const s = document.createElement('script')
    s.src = POPUNDER_SRC
    s.async = true
    s.referrerPolicy = 'no-referrer-when-downgrade'
    s.setAttribute('data-hilltop-popunder', '1')
    s.setAttribute('data-cfasync', 'false')
    ;(s as unknown as { settings: Record<string, unknown> }).settings = {}

    // Match the vendor snippet's injection pattern exactly:
    //   var l = d.scripts[d.scripts.length - 1]; l.parentNode.insertBefore(s, l);
    // Some HilltopAds variants read `document.currentScript` or look at the
    // last <script> on the page for configuration context, so we replicate it.
    const last = document.scripts[document.scripts.length - 1]
    if (last && last.parentNode) {
      last.parentNode.insertBefore(s, last)
    } else {
      document.head.appendChild(s)
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[hilltop] armed popunder', POPUNDER_SRC)
    }
  }, [])

  /** Remove any armed popunder script + clear vendor globals. */
  const disarmPopunder = useCallback(() => {
    if (typeof window === 'undefined') return
    document
      .querySelectorAll('script[data-hilltop-popunder="1"]')
      .forEach((s) => s.remove())
    clearVendorInternals()
  }, [])

  return { armPopunder, disarmPopunder }
}
