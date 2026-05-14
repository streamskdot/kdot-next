'use client'

import type { League } from '@/lib/supabase'
import { LeagueLogo } from './LeagueLogo'

interface LeagueTabsProps {
  leagues: League[]
  selectedLeague: string | null
  pendingLeague: string | null
  onSelectLeague: (slug: string | null) => void
}

const leagueGradients: Record<string, string> = {
  'champions-league': 'from-blue-600 to-indigo-700',
  'premier-league': 'from-purple-600 to-purple-800',
  'la-liga': 'from-red-500 to-red-700',
  'serie-a': 'from-green-600 to-green-800',
  'bundesliga': 'from-red-600 to-red-800',
  'ligue-1': 'from-blue-500 to-blue-700',
  'europa-league': 'from-orange-500 to-orange-700',
  'world-cup': 'from-yellow-500 to-yellow-700',
  'saudi-pro-league': 'from-blue-400 to-blue-600',
  'mls': 'from-sky-500 to-sky-700',
  'afc-champions-league': 'from-red-400 to-red-600',
}

function LeagueTabButton({ 
  league, 
  isSelected, 
  isPending, 
  onClick, 
  isAll = false 
}: { 
  league?: League
  isSelected: boolean
  isPending: boolean
  onClick: () => void
  isAll?: boolean
}) {
  const gradient = isAll ? 'from-red-500 to-red-600' : leagueGradients[league?.slug || ''] || 'from-zinc-500 to-zinc-600'

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 ${isPending ? 'opacity-70' : ''} ${
        isSelected 
          ? `bg-linear-to-r ${gradient} text-white ring-2 ring-white ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900` 
          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
      }`}
    >
      {isAll ? (
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) : (
        <LeagueLogo
          src={league?.logo_url}
          alt=""
          className="h-4 w-4 shrink-0"
        />
      )}
      <span>{isAll ? 'All Leagues' : league?.name}</span>
      {isPending && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      )}
    </button>
  )
}

export function LeagueTabs({ leagues, selectedLeague, pendingLeague, onSelectLeague }: LeagueTabsProps) {
  const isPendingLeague = (slug: string) => pendingLeague === slug

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <LeagueTabButton
        isAll
        isSelected={selectedLeague === null}
        isPending={false}
        onClick={() => onSelectLeague(null)}
      />
      {leagues.map((league) => (
        <LeagueTabButton
          key={league.slug}
          league={league}
          isSelected={selectedLeague === league.slug}
          isPending={isPendingLeague(league.slug)}
          onClick={() => onSelectLeague(league.slug)}
        />
      ))}
    </div>
  )
}
