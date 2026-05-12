'use client'

import { AdSlot728x90, AdSlot320x50 } from '@/app/components/AdSlot'

export function MatchDetailAdWrapper() {
  return (
    <>
      <div className="hidden lg:block">
        <AdSlot728x90 />
      </div>
      <div className="lg:hidden flex flex-wrap justify-center gap-0">
        <AdSlot320x50 />
        <AdSlot320x50 />
        <AdSlot320x50 />
      </div>
    </>
  )
}
