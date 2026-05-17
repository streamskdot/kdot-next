'use client'
import { useCallback } from 'react'

const POPUNDER_SCRIPT_URL =
  'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwOCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwibmFtZSI6InBvcHVuZGVyIGluIHBsYXllciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJwb3B1bmRlciIsInNldHRpbmdzIjp7InR5cGUiOiJwb3B1bmRlciIsInRyaWdnZXIiOnsidHlwZSI6ImNsYXNzIiwiY2xhc3NuYW1lcyI6WyIuYWRzdHVmZi1wb3B1bmRlciJdfSwiZnJlcXVlbmN5Q2FwcGluZyI6eyJhbW91bnQiOjIsImVuYWJsZWQiOnRydWUsImludGVyZmFsbCI6IjFtaW51dGVzIn19LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6MCwiY2xpY2tzIjowLCJ0b3RhbFJldmVudWUiOjAsImlzQmxvY2tlZCI6ZmFsc2V9fQ%3D%3D'

function clearAdstuffInternals() {
  try {
    const w = window as unknown as Record<string, unknown>
    for (const k of Object.keys(w)) {
      if (/^(_pop|popns|popMagic|adstuff|stuffserve)/i.test(k)) {
        delete w[k]
      }
    }
  } catch {
    // ignore
  }
}

export function useAdstuffPopunder(_active: boolean) {
  const armPopunder = useCallback(() => {
    if (typeof window === 'undefined') return

    document
      .querySelectorAll(`script[src="${POPUNDER_SCRIPT_URL}"]`)
      .forEach((s) => s.remove())
    clearAdstuffInternals()

    const script = document.createElement('script')
    script.src = POPUNDER_SCRIPT_URL
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.setAttribute('data-adstuff-popunder', '1')
    document.body.appendChild(script)
  }, [])

  const disarmPopunder = useCallback(() => {
    if (typeof window === 'undefined') return
    document
      .querySelectorAll(`script[src="${POPUNDER_SCRIPT_URL}"]`)
      .forEach((s) => s.remove())
    clearAdstuffInternals()
  }, [])

  return { armPopunder, disarmPopunder }
}
