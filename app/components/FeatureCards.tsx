import { Tv, Zap, Hd, Shield, Clock, Globe, Flame } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, type Match } from '@/lib/supabase'

interface FeatureBadgeProps {
  icon: React.ReactNode
  label: string
  gradient: string
}

interface TeamInfo {
  name: string
  short_name: string | null
  logo_url: string | null
}

interface HighlightedMatchCardProps {
  match: Match
  team1Data?: TeamInfo | null
  team2Data?: TeamInfo | null
}

function HighlightedMatchCard({ match, team1Data, team2Data }: HighlightedMatchCardProps) {
  const durationHours = Number(
    (match.raw_data as { duration?: number } | null)?.duration ?? 2,
  )

  // Client-side status calculation
  const getStatus = () => {
    if (!match.match_date || !match.display_time) return 'UPCOMING'

    const matchDate = new Date(match.match_date)
    const [hours, minutes] = match.display_time.split(':').map(Number)
    matchDate.setUTCHours(hours, minutes, 0, 0)

    const now = new Date()
    const endTime = new Date(matchDate.getTime() + durationHours * 60 * 60 * 1000)

    if (now >= matchDate && now <= endTime) return 'LIVE'
    if (now > endTime) return 'ENDED'
    return 'UPCOMING'
  }

  const status = getStatus()

  return (
    <div className="relative shrink-0 pt-2">
      {/* Status badge floating on top of card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shadow-lg ${
          status === 'LIVE' ? 'bg-red-500 text-white' :
          status === 'ENDED' ? 'bg-zinc-800 text-white' :
          'bg-green-500 text-white'
        }`}>
          {status}
        </div>
      </div>

      <Link href={`/match/${match.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-amber-500 to-orange-600 p-0.5 shadow-md">
          <div className="relative overflow-hidden rounded-md bg-white dark:bg-zinc-900">
            {/* Fire icon on left edge */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="flex h-8 w-6 items-center justify-center bg-amber-500 rounded-r-lg">
                <Flame className="h-4 w-4 fill-white text-white" />
              </div>
            </div>

            {/* Match content */}
            <div className="flex items-center justify-between gap-3 p-3 pl-10">
              {/* Team 1 */}
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {team1Data?.logo_url ? (
                    <Image
                      src={team1Data.logo_url}
                      alt={team1Data.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      {match.team1.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                  {team1Data?.short_name || team1Data?.name || match.team1}
                </span>
              </div>

              {/* Score/VS */}
              <div className="flex flex-col items-center gap-0.5 px-2">
                {match.team1_score != null && match.team2_score != null ? (
                  <div className="flex items-center gap-1 text-sm font-bold text-zinc-900 dark:text-white">
                    <span>{match.team1_score}</span>
                    <span className="text-zinc-400">-</span>
                    <span>{match.team2_score}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-zinc-400">VS</span>
                )}
              </div>

              {/* Team 2 */}
              <div className="flex flex-1 items-center justify-end gap-2">
                <span className="truncate text-right text-xs font-semibold text-zinc-900 dark:text-white">
                  {team2Data?.short_name || team2Data?.name || match.team2}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {team2Data?.logo_url ? (
                    <Image
                      src={team2Data.logo_url}
                      alt={team2Data.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      {match.team2.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function FeatureBadge({ icon, label, gradient }: FeatureBadgeProps) {
  return (
    <div className="group flex flex-col items-center gap-1.5 min-w-17.5 sm:min-w-20">
      {/* Icon container */}
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${gradient} shadow-md transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12`}>
        <div className="relative z-10 text-white">
          {icon}
        </div>
      </div>
      {/* Label */}
      <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

const features = [
  {
    icon: <Tv className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Free',
    gradient: 'from-red-500 to-red-600',
  },
  {
    icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Subtle Ads',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'No Buffer',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <Hd className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'HD',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'Live',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Globe className="h-5 w-5 sm:h-6 sm:w-6" />,
    label: 'All Leagues',
    gradient: 'from-cyan-500 to-cyan-600',
  },
]

async function getHighlightedMatch() {
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('is_highlighted', true)
    .order('match_date', { ascending: true })
    .limit(1)
    .single()

  if (!match) return null

  // Fetch teams for logo lookup and short_name
  const { data: teams } = await supabase
    .from('teams')
    .select('slug, name, short_name, logo_url')
    .in('slug', [match.team1, match.team2])

  const teamsMap = new Map((teams ?? []).map(t => [t.slug, { name: t.name, short_name: t.short_name, logo_url: t.logo_url }]))

  return {
    match: match as Match,
    team1Data: teamsMap.get(match.team1) ?? null,
    team2Data: teamsMap.get(match.team2) ?? null,
  }
}

export async function FeatureCards() {
  const highlightedMatchData = await getHighlightedMatch()

  return (
    <div className="mb-6">
      {/* Horizontal scrollable feature badges and highlighted match */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Highlighted Match Card */}
        {highlightedMatchData && (
          <HighlightedMatchCard
            match={highlightedMatchData.match}
            team1Data={highlightedMatchData.team1Data}
            team2Data={highlightedMatchData.team2Data}
          />
        )}

        {/* Feature Badges */}
        {features.map((feature) => (
          <FeatureBadge
            key={feature.label}
            icon={feature.icon}
            label={feature.label}
            gradient={feature.gradient}
          />
        ))}
      </div>
    </div>
  )
}
