'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * Overlay with play button UI that triggers adstuff popunders on first click.
 * After 300ms, overlay becomes transparent and allows iframe interaction.
 * Sandbox attribute on iframe blocks the provider's popunders.
 */
interface PlayerOverlayProps {
  onFirstClick?: () => void
  visible?: boolean
}

const POPUNDER_SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwOCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwibmFtZSI6InBvcHVuZGVyIGluIHBsYXllciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJwb3B1bmRlciIsInNldHRpbmdzIjp7InR5cGUiOiJwb3B1bmRlciIsInRyaWdnZXIiOnsidHlwZSI6ImNsYXNzIiwiY2xhc3NuYW1lcyI6WyIuYWRzdHVmZi1wb3B1bmRlciJdfSwiZnJlcXVlbmN5Q2FwcGluZyI6eyJhbW91bnQiOjIsImVuYWJsZWQiOnRydWUsImludGVyZmFsbCI6IjFtaW51dGVzIn19LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6MCwiY2xpY2tzIjowLCJ0b3RhbFJldmVudWUiOjAsImlzQmxvY2tlZCI6ZmFsc2V9fQ%3D%3D'

export const PlayerOverlay = forwardRef<HTMLDivElement, PlayerOverlayProps>(
  ({ onFirstClick, visible = true }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null)
    const overlayRef = (ref as React.RefObject<HTMLDivElement>) || internalRef
    const [hasClicked, setHasClicked] = useState(false)
    const scriptReadyRef = useRef(false)
    const pendingClickRef = useRef(false)
    const performClickRef = useRef<(() => void) | null>(null)

    // Keep performClick up to date without triggering re-renders or effect deps
    performClickRef.current = () => {
      setHasClicked(true)
      onFirstClick?.()
      setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.style.pointerEvents = 'none'
          overlayRef.current.style.opacity = '0'
        }
      }, 300)
    }

    // Load popunder script dynamically after this element is mounted
    useEffect(() => {
      if (typeof window === 'undefined') return

      const scriptId = 'adstuff-popunder-player'
      if (document.getElementById(scriptId)) {
        scriptReadyRef.current = true
        return
      }

      const script = document.createElement('script')
      script.id = scriptId
      script.src = POPUNDER_SCRIPT_URL
      script.async = true
      script.onload = () => {
        // Give script time to initialize click listeners after load
        setTimeout(() => {
          scriptReadyRef.current = true
          // If user clicked while waiting, execute now
          if (pendingClickRef.current) {
            pendingClickRef.current = false
            performClickRef.current?.()
          }
        }, 600)
      }
      script.onerror = () => {
        console.warn('[Adstuff] popunder script failed to load')
        scriptReadyRef.current = true
        if (pendingClickRef.current) {
          pendingClickRef.current = false
          performClickRef.current?.()
        }
      }
      document.body.appendChild(script)
    }, [])

    const handleClick = () => {
      if (hasClicked) return
      if (scriptReadyRef.current) {
        performClickRef.current?.()
      } else {
        pendingClickRef.current = true
      }
    }

    return (
      <div
        ref={overlayRef}
        onClick={handleClick}
        className="adstuff-popunder absolute inset-0 z-10 transition-opacity duration-300 group"
        style={{
          cursor: 'pointer',
          background: 'transparent',
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full bg-white/10 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-black/50 border-2 border-white/60
                              flex items-center justify-center
                              shadow-[0_0_30px_rgba(255,255,255,0.3)]
                              group-hover:bg-black/70 group-hover:border-white
                              group-hover:shadow-[0_0_45px_rgba(255,255,255,0.5)]
                              transition-all duration-200">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

PlayerOverlay.displayName = 'PlayerOverlay'
