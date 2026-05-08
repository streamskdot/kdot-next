'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { ExoclickAd } from './ExoclickAd'

interface ExoclickDialogProps {
  isOpen: boolean
  onClose: () => void
  streamUrl: string
  matchId: string
  streamIndex: number
}

function DialogContent() {
  return (
    <div className="min-h-[300px] w-full">
      <ExoclickAd className="h-full w-full" />
    </div>
  )
}

export function ExoclickDialog({ isOpen, onClose, streamUrl, matchId, streamIndex }: ExoclickDialogProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanSkip(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleGoToVideo = () => {
    router.push(`/watch?url=${encodeURIComponent(streamUrl)}&match=${matchId}&n=${streamIndex}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      {/* Header - Outside Dialog */}
      <div className="w-full max-w-lg flex items-center justify-between px-3 py-2 mb-2 bg-black/50 backdrop-blur-sm rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded">[AD]</span>
          <span className="text-sm font-bold text-white">KdotTV</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleGoToVideo}
            disabled={!canSkip}
            className={`text-xs font-semibold px-3 py-1 rounded transition-all ${
              canSkip
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {canSkip ? 'Skip Ad' : `${countdown}s`}
          </button>
        </div>
      </div>

      {/* Dialog Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-transparent overflow-hidden" key={isOpen ? 'open' : 'closed'}>
        <DialogContent />
      </div>

      {/* Support Text - Below Dialog */}
      <div className="w-full max-w-lg mt-3 text-center">
        <p className="text-xs text-white/80 drop-shadow-lg">
          Your support is what keeps this service alive. Thanks ❤️
        </p>
      </div>
    </div>
  )
}
