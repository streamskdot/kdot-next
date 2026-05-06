'use client'

import { useLiveViewCount } from '@/hooks/useLiveViewCount'

interface LiveViewerCountProps {
  videoId: string
}

/**
 * Client component that displays live viewer count with pulsing green dot
 */
export function LiveViewerCount({ videoId }: LiveViewerCountProps) {
  const { viewerCount } = useLiveViewCount(videoId)

  if (!videoId) return null

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
      <div className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
      </div>
      <span className="text-sm font-medium text-white">
        {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
      </span>
    </div>
  )
}
