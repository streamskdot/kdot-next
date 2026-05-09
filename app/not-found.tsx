'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { Navbar } from '@/app/components/Navbar'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl font-black text-zinc-200 dark:text-zinc-800">
                404
              </h1>
            </div>

            {/* Message */}
            <div className="mb-8 space-y-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                Page Not Found
              </h2>
              <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
                Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-750"
              >
                <Search className="h-5 w-5" />
                Browse Matches
              </Link>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
