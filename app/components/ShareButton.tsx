'use client'

import { useState } from 'react'
import { Copy, Share2 } from 'lucide-react'

export function ShareButton() {
  const [showToast, setShowToast] = useState(false)

  const handleShare = async () => {
    // Copy current URL to clipboard
    await navigator.clipboard.writeText(window.location.href)
    
    // Show toast
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 active:scale-95"
      >
        <Copy className="h-4 w-4" />
        <Share2 className="h-4 w-4" />
        Copy Link
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900 animate-in fade-in slide-in-from-bottom-4">
          Link copied!
        </div>
      )}
    </>
  )
}
