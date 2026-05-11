'use client'
import { useRef } from 'react'
import { useAdsteraBanner } from '@/hooks/useAdsteraBanner'

interface Props {
  className?: string
  onAdLoadError?: () => void
  reinitTrigger?: number
}

export function AdsterraBanner728x90({ className = '', onAdLoadError, reinitTrigger }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useAdsteraBanner(
    containerRef,
    {
      key: 'c22ec2a12af103ab3b80567c83bec0c6',
      invokeUrl: 'https://rhubarbambassadorweep.com/c22ec2a12af103ab3b80567c83bec0c6/invoke.js',
      width: 728,
      height: 90,
    },
    onAdLoadError,
    reinitTrigger
  )
  return <div ref={containerRef} className={className} />
}
