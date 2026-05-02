'use client'

import type { League } from '@/lib/supabase'
import { LeagueLogo } from './LeagueLogo'

interface LeagueTabsProps {
  leagues: League[]
  selectedLeague: string | null
  pendingLeague: string | null
  onSelectLeague: (slug: string | null) => void
}

export function LeagueTabs({ leagues, selectedLeague, pendingLeague, onSelectLeague }: LeagueTabsProps) {
  const isPendingAll = pendingLeague === null && selectedLeague !== null
  const isPendingLeague = (slug: string) => pendingLeague === slug

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectLeague(null)}
        disabled={pendingLeague !== null}
        className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
          selectedLeague === null
            ? 'bg-red-600 text-white'
            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        } ${isPendingAll ? 'opacity-70' : ''}`}
      >
        All Leagues
        {isPendingAll && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        )}
      </button>
      {leagues.map((league) => {
        const isSelected = selectedLeague === league.slug
        const isPending = isPendingLeague(league.slug)

        return (
          <button
            key={league.slug}
            onClick={() => onSelectLeague(league.slug)}
            disabled={pendingLeague !== null}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isSelected || isPending
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            } ${isPending ? 'opacity-70' : ''}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <LeagueLogo
                src={league.logo_url}
                alt=""
                className="h-4 w-4"
              />
              {league.name}
            </span>
            {isPending && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            )}
          </button>
        )
      })}
    </div>
  )
}
