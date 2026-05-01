'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { LeagueTabs } from './LeagueTabs'
import type { League } from '@/lib/supabase'

interface LeagueTabsClientProps {
  leagues: League[]
}

export function LeagueTabsClient({ leagues }: LeagueTabsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedLeague = searchParams.get('league')
  const [isPending, startTransition] = useTransition()
  const [pendingLeague, setPendingLeague] = useState<string | null>(null)

  const handleSelectLeague = (slug: string | null) => {
    setPendingLeague(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('league', slug)
    } else {
      params.delete('league')
    }
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <LeagueTabs
        leagues={leagues}
        selectedLeague={selectedLeague}
        pendingLeague={isPending ? pendingLeague : null}
        onSelectLeague={handleSelectLeague}
      />
      {isPending && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden bg-zinc-200 dark:bg-zinc-700">
          <div className="h-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-red-500 to-transparent" />
        </div>
      )}
    </div>
  )
}
