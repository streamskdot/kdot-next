'use client'
import { useEffect } from 'react'

const SOCIAL_BAR_SRC =
  'https://rhubarbambassadorweep.com/a7/fb/5d/a7fb5dc262abe33ecfa30b6db729fee3.js'

let socialBarLoaded = false

/**
 * Social Bar is a global persistent UI element managed by Adsterra itself.
 * Load it exactly once per page session in an isolated iframe to prevent
 * auto-redirects from affecting the main page.
 */
export function useAdsteraSocialBar() {
  useEffect(() => {
    if (socialBarLoaded) return
    if (typeof window === 'undefined') return

    // Create iframe container
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.right = '0'
    iframe.style.width = '100%'
    iframe.style.height = 'auto'
    iframe.style.minHeight = '60px'
    iframe.style.border = 'none'
    iframe.style.zIndex = '99999'
    iframe.title = 'Adsterra Social Bar'

    // Set iframe content with the script
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="${SOCIAL_BAR_SRC}"></script>
        <style>
          body { margin: 0; overflow: visible; }
        </style>
      </head>
      <body></body>
      </html>
    `

    document.body.appendChild(iframe)
    socialBarLoaded = true

    return () => {
      iframe.remove()
      socialBarLoaded = false
    }
  }, [])
}
