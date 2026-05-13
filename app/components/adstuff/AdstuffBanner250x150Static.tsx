'use client'
import { useEffect } from 'react'

interface Props {
  className?: string
}

const SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWhNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwNCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwibmFtZSI6ImJhbm5lciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJiYW5uZXIiLCJzZXR0aW5ncyI6eyJoIjoxNTAsInciOjI1MCwidHlwZSI6ImJhbm5lciJ9LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6MCwiY2xpY2tzIjowLCJ0b3RhbFJldmVudWUiOjAsImlzQmxvY2tlZCI6ZmFsc2V9fQ%3D%3D'

/**
 * Static Adstuff 250x150 banner - no refresh, loads once on mount.
 */
export function AdstuffBanner250x150Static({ className = '' }: Props) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div
      className={`${className} lg:hidden`}
      style={{ width: 250, minHeight: 150 }}
    />
  )
}
