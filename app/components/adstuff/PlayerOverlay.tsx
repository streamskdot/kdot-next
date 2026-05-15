'use client'

import { forwardRef, useRef, useState } from 'react'

/**
 * Overlay with play button UI that triggers adstuff popunders on first click.
 * After 300ms, overlay becomes transparent and allows iframe interaction.
 * Sandbox attribute on iframe blocks the provider's popunders.
 */
interface PlayerOverlayProps {
  onFirstClick?: () => void
  visible?: boolean
}

export const PlayerOverlay = forwardRef<HTMLDivElement, PlayerOverlayProps>(
  ({ onFirstClick, visible = true }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null)
    const overlayRef = (ref as React.RefObject<HTMLDivElement>) || internalRef
    const [hasClicked, setHasClicked] = useState(false)

    const handleClick = () => {
      if (!hasClicked) {
        setHasClicked(true)
        onFirstClick?.()

        // After 300ms, make overlay transparent and allow iframe interaction
        setTimeout(() => {
          if (overlayRef.current) {
            overlayRef.current.style.pointerEvents = 'none'
            overlayRef.current.style.opacity = '0'
          }
        }, 300)
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
