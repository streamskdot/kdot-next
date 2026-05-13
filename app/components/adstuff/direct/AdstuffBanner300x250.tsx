'use client'
import { useEffect, useRef } from 'react'

interface Props {
  className?: string
  reinitTrigger?: number
}

const SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwNSwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xM1QxMDoxMjo0NC44MzdaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xM1QxMDoxMjo0NC44MzdaIiwibmFtZSI6IjMwMHgyNTAiLCJ3ZWJzaXRlSWQiOiJ4QWJqVFlMTlRYc1g4TEgyNEc3LUUiLCJ0eXBlIjoiYmFubmVyIiwic2V0dGluZ3MiOnsiaCI6MjUwLCJ3IjozMDAsInR5cGUiOiJiYW5uZXIifSwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIiwic3ViSWRFbmFibGVkIjpmYWxzZSwiZGVmYXVsdFN1YklkIjoiIiwiaW1wcmVzc2lvbnMiOjAsImNsaWNrcyI6MCwidG90YWxSZXZlbnVlIjowLCJpc0Jsb2NrZWQiOmZhbHNlfX0%3D'

/**
 * Adstuff 300x250 banner rendered in an iframe. Refresh by
 * incrementing `reinitTrigger`.
 */
export function AdstuffBanner300x250({ className = '', reinitTrigger }: Props) {
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
            html, body { margin: 0; padding: 0; overflow: hidden; width: 300px; height: 250px; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <script>
            setTimeout(() => {
              const images = document.querySelectorAll('body > img');
              if (images.length >= 2) {
                images[0].remove();
                images[1].remove();
              }
            }, 100);
          </script>
        </body>
      </html>
    `)
    doc.close()
  }, [reinitTrigger])

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{ width: 300, height: 250, border: 'none', overflow: 'hidden' }}
      title="Adstuff Banner"
      scrolling="no"
    />
  )
}
