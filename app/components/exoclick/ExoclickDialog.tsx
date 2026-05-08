'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, MonitorPlay, X } from 'lucide-react'
import { ExoclickAd } from './ExoclickAd'

interface ExoclickDialogProps {
  isOpen: boolean
  onClose: () => void
  streamUrl: string
  matchId: string
  streamIndex: number
}

function DialogContent({ streamUrl, matchId, streamIndex, onClose }: { streamUrl: string; matchId: string; streamIndex: number; onClose: () => void }) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [canSkip, setCanSkip] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanSkip(true)
          setProgress(100)
          return 0
        }
        setProgress((5 - prev + 1) * 20)
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleGoToVideo = () => {
    router.push(`/watch?url=${encodeURIComponent(streamUrl)}&match=${matchId}&n=${streamIndex}`)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <>
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-500 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <MonitorPlay className="h-5 w-5 text-white" />
          <h1 className="text-lg font-bold text-white">kdotTV</h1>
        </div>
        <p className="text-xs text-white/90 mt-1">Advertisement • Support us</p>
      </div>

      {/* Ad Content */}
      <div className="p-3 sm:p-6">
        <div className="rounded-lg bg-zinc-50 p-2 sm:p-4 dark:bg-zinc-800">
          <div className="min-h-[300px] w-full">
            <ExoclickAd className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Footer with Progress Bar and Countdown */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-6 sm:py-6 dark:border-zinc-700 dark:bg-zinc-800">
        {/* Progress Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div 
              className="h-full bg-linear-to-r from-red-500 to-red-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Countdown or Buttons */}
        {!canSkip ? (
          <p className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Watch video in {countdown}...
          </p>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-red-500 px-4 py-2 sm:px-6 sm:py-3 font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              Close
            </button>
            <button
              onClick={handleGoToVideo}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-red-500 to-red-400 px-4 py-2 sm:px-6 sm:py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-red-500/30"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              Watch Match
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export function ExoclickDialog({ isOpen, onClose, streamUrl, matchId, streamIndex }: ExoclickDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 overflow-hidden" key={isOpen ? 'open' : 'closed'}>
        <DialogContent streamUrl={streamUrl} matchId={matchId} streamIndex={streamIndex} onClose={onClose} />
      </div>
    </div>
  )
}
