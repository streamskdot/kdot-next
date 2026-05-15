'use client'

import { useEffect } from 'react'

interface UseAdstuffInPagePushOptions {
  /** Unique identifier for this ad instance (prevents duplicate loads) */
  id?: string
  /** Whether to load the script immediately or wait */
  enabled?: boolean
}

const DEFAULT_SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwOSwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xNVQwMTo0NToyMy4yODFaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xNVQwMTo0NToyMy4yODFaIiwibmFtZSI6ImlucHVzaCBiYW5uZXIiLCJ3ZWJzaXRlSWQiOiJ4QWJqVFlMTlRYc1g4TEgyNEc3LUUiLCJ0eXBlIjoiaW4tcGFnZS1wdXNoIiwic2V0dGluZ3MiOnsidHlwZSI6ImluLXBhZ2UtcHVzaCIsInBvc2l0aW9uIjoicmlnaHQtdG9wIiwic2Vzc2lvbkNhcCI6MywiaGlkZUZvck9uQ2xvc2UiOiIxMHNlY29uZHMiLCJmaXJzdE5vdGlmaWNhdGlvbkRlbGF5IjoiNXNlY29uZHMiLCJtYXhOdW1iZXJPZk5vdGlmaWNhdGlvbnNPbnBhZ2UiOjN9LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6MCwiY2xpY2tzIjowLCJ0b3RhbFJldmVudWUiOjAsImlzQmxvY2tlZCI6ZmFsc2V9fQ%3D%3D'

/**
 * Loads the adstuff in-page push notification script.
 * Only loads once per id to prevent duplicates.
 */
export function useAdstuffInPagePush(options: UseAdstuffInPagePushOptions = {}) {
  const { id = 'default', enabled = true } = options

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const scriptId = `adstuff-inpage-push-${id}`
    if (document.getElementById(scriptId)) {
      console.log('[Adstuff] In-page push script already loaded')
      return
    }

    console.log('[Adstuff] Loading in-page push script...')

    const script = document.createElement('script')
    script.id = scriptId
    script.src = DEFAULT_SCRIPT_URL
    script.async = true

    script.onload = () => {
      console.log('[Adstuff] In-page push script loaded successfully')
    }
    script.onerror = (err) => {
      console.error('[Adstuff] In-page push script failed to load:', err)
    }

    document.body.appendChild(script)

    return () => {
      // Optional: remove script on unmount if needed
      // const existing = document.getElementById(scriptId)
      // if (existing) existing.remove()
    }
  }, [id, enabled])
}
