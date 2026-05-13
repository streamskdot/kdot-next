'use client'

import { AdsterraBanner320x50 } from './direct/AdsterraBanner320x50'

interface Props {
  className?: string
}

export function AdsterraBanner320x50WithRefreshOffset({ className = '' }: Props) {
  return <AdsterraBanner320x50 className={className} />
}
