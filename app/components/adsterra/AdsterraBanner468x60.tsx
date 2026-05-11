'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner468x60({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: '7077010ec8194988c50b2be130a48d12',
      invokeUrl: 'https://rhubarbambassadorweep.com/7077010ec8194988c50b2be130a48d12/invoke.js',
      width: 468,
      height: 60,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
