'use client'
import { useEffect } from 'react'

const SOCIAL_BAR_SRC =
  'https://rhubarbambassadorweep.com/a7/fb/5d/a7fb5dc262abe33ecfa30b6db729fee3.js'

let socialBarLoaded = false

/**
 * Social Bar is a global persistent UI element managed by Adsterra itself.
 * Load it exactly once per page session — it owns its own DOM thereafter.
 */
export function useAdsteraSocialBar() {
  useEffect(() => {
    if (socialBarLoaded) return
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = SOCIAL_BAR_SRC
    script.async = true
    document.head.appendChild(script)
    socialBarLoaded = true
  }, [])
}
