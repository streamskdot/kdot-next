'use client'

import Script from 'next/script'

/**
 * Injects the adstuff popunder script globally into the document head.
 * This script handles frequency capping and popunder triggering on elements with the .adstuff-popunder class.
 */
export function AdstuffScript() {
  return (
    <Script
      src="https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwOCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xNFQxNzoyNDo1OC44MDlaIiwibmFtZSI6InBvcHVuZGVyIGluIHBsYXllciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJwb3B1bmRlciIsInNldHRpbmdzIjp7InR5cGUiOiJwb3B1bmRlciIsInRyaWdnZXIiOnsidHlwZSI6ImNsYXNzIiwiY2xhc3NuYW1lcyI6WyIuYWRzdHVmZi1wb3B1bmRlciJdfSwiZnJlcXVlbmN5Q2FwcGluZyI6eyJhbW91bnQiOjIsImVuYWJsZWQiOnRydWUsImludGVyZmFsbCI6IjFtaW51dGVzIn19LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6MCwiY2xpY2tzIjowLCJ0b3RhbFJldmVudWUiOjAsImlzQmxvY2tlZCI6ZmFsc2V9fQ%3D%3D"
      strategy="afterInteractive"
      defer
    />
  )
}
