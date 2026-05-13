'use client'

import { AdsterraBanner468x60 } from './AdsterraBanner468x60'

interface Props {
  className?: string
}

export function AdsterraBanner468x60WithRefresh({ className = '' }: Props) {
  return <AdsterraBanner468x60 className={className} />
}
