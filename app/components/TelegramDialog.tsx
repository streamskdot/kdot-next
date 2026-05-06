'use client'

import { useEffect, useState } from 'react'
import { X, Send, Sparkles } from 'lucide-react'

export function TelegramDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Small delay for smooth entrance
    setTimeout(() => {
      setIsOpen(true)
      setIsAnimating(true)
    }, 3000)
  }, [])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-lg transition-colors hover:bg-white hover:text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/40">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-cyan-400/20 blur-xl" />
          
          {/* Sparkles */}
          <div className="absolute top-4 right-4">
            <Sparkles className="h-6 w-6 text-white/40" />
          </div>

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="mb-6 inline-flex">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-white/30 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Send className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-3 text-2xl font-bold text-white">
              Join Our Communities 🚀
            </h2>

            {/* Subtitle */}
            <p className="mb-6 text-lg text-blue-100">
              Get live match links & instant updates
            </p>

            {/* Features */}
            <div className="mb-8 space-y-2 text-left">
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Live streaming links</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Match notifications</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Score updates</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <a
                href="https://t.me/+OpTUPK3X0NwyNmZh"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-blue-600 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-blue-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.11-.04-.16-.05-.05-.12-.03-.17-.02-.07.02-1.14.73-3.2 2.13-.3.21-.57.31-.82.31-.27 0-.53-.14-.77-.27l-.03-.02c-.54-.28-1.15-.6-1.15-1.18 0-.4.22-.62.63-.82l.05-.02c2.38-1.04 3.93-1.72 4.66-2.05.67-.3 1.29-.29 1.68-.17.42.13.76.43.82.84.05.35.12.7.14 1.05z"/>
                </svg>
                Join Telegram Channel ✈️
              </a>
              <a
                href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:bg-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Join WhatsApp Group 💬
              </a>
            </div>

            {/* Dismiss Text */}
            <button
              onClick={handleClose}
              className="mt-4 text-sm text-blue-200 transition-colors hover:text-white"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
