'use client'
import { useEffect, useRef } from 'react'

interface Props {
  className?: string
  reinitTrigger?: number
}

const SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwNCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwibmFtZSI6ImJhbm5lciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJiYW5uZXIiLCJzZXR0aW5ncyI6eyJoIjoxNTAsInciOjI1MCwidHlwZSI6ImJhbm5lciJ9LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6ODIsImNsaWNrcyI6MCwidG90YWxSZXZlbnVlIjowLCJpc0Jsb2NrZWQiOmZhbHNlfX0%3D'

/**
 * Adstuff 250x150 banner rendered in an iframe. Refresh by
 * incrementing `reinitTrigger`.
 */
export function AdstuffBanner250x150({ className = '', reinitTrigger }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    // Write the HTML with the script
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="${SCRIPT_URL}" defer></script>
          <style>
            html, body { margin: 0; padding: 0; overflow: hidden; width: 250px; height: 200px; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
        </body>
      </html>
    `)
    doc.close()
  }, [reinitTrigger])

  return (
    <iframe
      ref={iframeRef}
      className={`${className} lg:hidden`}
      style={{ width: 250, height: 200, border: 'none', overflow: 'hidden' }}
      title="Adstuff Banner"
      scrolling="no"
    />
  )
}
