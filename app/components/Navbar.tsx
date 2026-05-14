'use client'

import { useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.697.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

// kdotTV Logo component (light navbar version)
function KdotTVLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0">
        <defs>
          <linearGradient id="redgrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2d44"/>
            <stop offset="100%" stopColor="#b50020"/>
          </linearGradient>
        </defs>
        <rect width="26" height="26" rx="6" fill="url(#redgrad)"/>
        <rect x="7" y="4" width="3.5" height="18" rx="1.5" fill="white"/>
        <line x1="10.5" y1="13" x2="20" y2="4" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="10.5" y1="13" x2="20.5" y2="22" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="10.5" cy="13" r="2" fill="#e63946"/>
        <circle cx="10.5" cy="13" r="1.2" fill="white"/>
      </svg>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
          kdot
        </span>
        <span className="text-xl font-normal text-red-600 dark:text-red-500" style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>
          TV
        </span>
      </div>
    </div>
  )
}

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// Unique hamburger menu icon
function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

// Close icon
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const isCricket = pathname === '/cricket'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-sm dark:border-zinc-800/50 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Left side - Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger menu - mobile only */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/50 text-zinc-600 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:shadow-zinc-900/20"
              aria-label="Open menu"
            >
              <HamburgerIcon className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <KdotTVLogo />
            </Link>
          </div>

          {/* Sport Switcher - desktop only */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-zinc-100/50 rounded-2xl dark:bg-zinc-800/50">
            <Link
              href="/"
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isCricket
                  ? 'bg-white text-red-600 shadow-md dark:bg-zinc-700 dark:text-red-400 dark:shadow-zinc-900/20'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-700/50'
              }`}
            >
              Football
              {!isCricket && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20" />
              )}
            </Link>
            <Link
              href="/cricket"
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isCricket
                  ? 'bg-white text-red-600 shadow-md dark:bg-zinc-700 dark:text-red-400 dark:shadow-zinc-900/20'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-700/50'
              }`}
            >
              Cricket
              {isCricket && (
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20" />
              )}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/BJu6MrOqJw0HP950k5E3He"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/50 text-green-500 shadow-sm transition-all duration-300 hover:border-green-300 hover:bg-green-50 hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-green-400 dark:hover:border-green-700 dark:hover:bg-green-950/30 dark:hover:shadow-green-900/20"
              aria-label="Contact us on WhatsApp"
            >
              <WhatsAppIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-green-500/0 to-green-600/0 opacity-0 transition-all duration-300 group-hover:from-green-500/10 group-hover:to-green-600/10 group-hover:opacity-100 dark:group-hover:from-green-500/20 dark:group-hover:to-green-600/20" />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+OpTUPK3X0NwyNmZh"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/50 text-sky-500 shadow-sm transition-all duration-300 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-sky-400 dark:hover:border-sky-700 dark:hover:bg-sky-950/30 dark:hover:shadow-sky-900/20"
              aria-label="Join us on Telegram"
            >
              <TelegramIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-sky-500/0 to-sky-600/0 opacity-0 transition-all duration-300 group-hover:from-sky-500/10 group-hover:to-sky-600/10 group-hover:opacity-100 dark:group-hover:from-sky-500/20 dark:group-hover:to-sky-600/20" />
            </a>

            {/* Theme Toggle */}
            <div className="relative">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl dark:bg-zinc-950/95 lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-zinc-200/50 px-5 dark:border-zinc-800/50">
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                Menu
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 transition-all duration-300 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-5">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  !isCricket
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">⚽</span>
                Football
                {!isCricket && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-red-500/20 to-red-600/20" />
                )}
              </Link>
              <Link
                href="/cricket"
                onClick={() => setIsSidebarOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                  isCricket
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">🏏</span>
                Cricket
                {isCricket && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-br from-red-500/20 to-red-600/20" />
                )}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
