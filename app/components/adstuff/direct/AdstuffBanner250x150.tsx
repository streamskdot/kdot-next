'use client'
import { useRef } from 'react'
import { useAdstuffDirectRefresh } from '@/hooks/useAdstuffDirectRefresh'

interface Props {
  className?: string
  reinitTrigger?: number
}

const SCRIPT_URL = 'https://ad.stuffserve.me/script.js?data=eyJ3ZWJzaXRlIjp7ImlkIjoieEFialRZTE5UWHNYOExIMjRHNy1FIiwibmFtZSI6Imtkb3QiLCJkb21haW4iOiJrZG90di5jb20iLCJ1c2VySWQiOjQwNiwiY2F0ZWdvcnkiOiJJQUIyNCIsInN1YkNhdGVnb3J5IjoiIn0sInpvbmUiOnsiaWQiOjgwNCwiY3JlYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwidXBkYXRlZEF0IjoiMjAyNi0wNS0xM1QwNzozMzowOC44ODFaIiwibmFtZSI6ImJhbm5lciIsIndlYnNpdGVJZCI6InhBYmpUWUxOVFhzWDhMSDI0RzctRSIsInR5cGUiOiJiYW5uZXIiLCJzZXR0aW5ncyI6eyJoIjoxNTAsInciOjI1MCwidHlwZSI6ImJhbm5lciJ9LCJjYXRlZ29yeSI6IklBQjI0Iiwic3ViQ2F0ZWdvcnkiOiIiLCJzdWJJZEVuYWJsZWQiOmZhbHNlLCJkZWZhdWx0U3ViSWQiOiIiLCJpbXByZXNzaW9ucyI6ODIsImNsaWNrcyI6MCwidG90YWxSZXZlbnVlIjowLCJpc0Jsb2NrZWQiOmZhbHNlfX0%3D'

/**
 * Adstuff 250x150 banner rendered directly in div. Refresh by
 * incrementing `reinitTrigger`.
 */
export function AdstuffBanner250x150({ className = '', reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdstuffDirectRefresh(
    containerRef,
    { scriptUrl: SCRIPT_URL, width: 250, height: 150 },
    reinitTrigger,
  )
  return (
    <div
      ref={containerRef}
      className={`${className} lg:hidden`}
      style={{ width: 250, minHeight: 150 }}
    />
  )
}
