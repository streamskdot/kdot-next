import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Navbar } from '@/app/components/Navbar'
import { MatchTimer, MatchStatusBadge } from '@/app/components/MatchTimer'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ExternalLink, Radio, Trophy, Users, HelpCircle, Video, MonitorPlay, ChevronDown } from 'lucide-react'

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

async function getMatchDetails(id: string) {
  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !match) {
    return null
  }

  // Fetch team details
  const { data: teams } = await supabase
    .from('teams')
    .select('slug, name, logo_url')
    .in('slug', [match.team1, match.team2])

  const teamsMap = new Map((teams ?? []).map(t => [t.slug, { name: t.name, logo_url: t.logo_url }]))

  // Fetch league details
  const { data: league } = await supabase
    .from('leagues')
    .select('name, logo_url')
    .eq('slug', match.league)
    .single()

  return {
    match,
    team1Data: teamsMap.get(match.team1) ?? null,
    team2Data: teamsMap.get(match.team2) ?? null,
    leagueData: league ?? null,
  }
}

function formatMatchTime(matchDate: string | null, displayTime: string | null) {
  if (!matchDate || !displayTime) return null
  
  const datePart = matchDate.split('T')[0]
  const utcDateStr = `${datePart}T${displayTime}:00Z`
  const matchDateTime = new Date(utcDateStr)
  
  if (isNaN(matchDateTime.getTime())) return null
  
  return matchDateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function generateMatchInfo(match: { status: string; match_date: string | null; display_time: string | null; team1_score: string | null; team2_score: string | null }, team1Name: string, team2Name: string, leagueName: string | null) {
  const formattedTime = formatMatchTime(match.match_date, match.display_time)
  const leagueText = leagueName ? ` in the ${leagueName}` : ''
  
  let statusText = ''
  if (match.status === 'live') {
    statusText = ` is currently live! The excitement is unfolding as ${team1Name} takes on ${team2Name}${leagueText}. `
    if (match.team1_score && match.team2_score) {
      statusText += `The score stands at ${match.team1_score} - ${match.team2_score}. `
    }
    statusText += `Don't miss a moment of this thrilling encounter. `
  } else if (match.status === 'upcoming') {
    statusText = ` is scheduled to kick off on ${formattedTime}. `
    statusText += `Football fans are eagerly anticipating this clash between ${team1Name} and ${team2Name}${leagueText}. `
    statusText += `Make sure to tune in and catch all the action live. `
  } else {
    statusText = ` has concluded. `
    if (match.team1_score && match.team2_score) {
      statusText += `The final score was ${match.team1_score} - ${match.team2_score}. `
    }
    statusText += `Thank you for following this match between ${team1Name} and ${team2Name}${leagueText}. `
  }
  
  return `This exciting matchup between ${team1Name} and ${team2Name}${statusText}${team1Name} and ${team2Name} are set to deliver an unforgettable football experience. Whether you're a die-hard fan or a casual viewer, this match promises top-tier action and memorable moments on the pitch.`
}

function TeamDisplay({ 
  teamSlug, 
  teamData, 
  score 
}: { 
  teamSlug: string
  teamData: { name: string; logo_url: string | null } | null
  score: string | null 
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-inner">
        {teamData?.logo_url ? (
          <Image
            src={teamData.logo_url}
            alt={teamData.name}
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            unoptimized
          />
        ) : (
          <span className="text-2xl font-bold text-zinc-400">
            {teamSlug.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-center text-lg font-bold text-zinc-900 dark:text-white max-w-30">
        {teamData?.name || teamSlug}
      </span>
      {score && (
        <span className="text-3xl font-black text-zinc-900 dark:text-white">
          {score}
        </span>
      )}
    </div>
  )
}

function BulletinBanner() {
  return (
    <div className="rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg">
      <div className="rounded-lg bg-white/95 dark:bg-zinc-900/95 p-4 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Video className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white">Watch in HD Quality</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
              Watch the live of this match in HD Quality. Scroll down to check out every link for Smooth Live Stream of this match.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LineupInfoSection() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Team Lineups
        </h2>
      </div>
      
      <div className="rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="flex items-start gap-3">
          <MonitorPlay className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Predicted lineups are available for the match a few days in advance while the actual lineup will be available about an hour ahead of the match.
          </p>
        </div>
      </div>
    </div>
  )
}

function FAQSection({ team1Name, team2Name, leagueName, matchDate }: { team1Name: string; team2Name: string; leagueName: string | null; matchDate: string | null }) {
  const faqs = [
    {
      question: `When is the ${team1Name} vs ${team2Name} match?`,
      answer: matchDate 
        ? `The match is scheduled for ${new Date(matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Please check the match card above for the exact kickoff time in your local timezone.`
        : `The exact match date and time will be updated soon. Please bookmark this page and check back later for the latest information.`
    },
    {
      question: `Where can I watch ${team1Name} vs ${team2Name} live stream?`,
      answer: `You can watch the live stream of this match by scrolling up to the "Watch Live" section. We provide multiple stream links for the best viewing experience. Additionally, join our Telegram channel for instant updates.`
    },
    {
      question: `Is the live stream free to watch?`,
      answer: `Yes, all stream links provided on KdotTV are completely free to access. We do not charge any fees for watching live football matches.`
    },
    {
      question: `Which league or competition is this match part of?`,
      answer: leagueName 
        ? `This match is part of the ${leagueName}. It is an official competitive fixture.`
        : `This match is part of a competitive football fixture. League information will be updated soon.`
    },
    {
      question: `What time does the match start in my timezone?`,
      answer: `The match time shown on this page is automatically converted to your local timezone based on your device settings. Please refer to the match card at the top of the page for the accurate local time.`
    },
    {
      question: `Can I watch this match on mobile?`,
      answer: `Yes, all our stream links are mobile-friendly and work on smartphones, tablets, and desktop devices. Simply click on any stream link to start watching.`
    }
  ]

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between p-4 text-left">
              <span className="font-medium text-zinc-900 dark:text-white pr-4">{faq.question}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400" />
            </summary>
            <div className="border-t border-zinc-200 px-4 pb-4 pt-2 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

function StreamLinksSection({ streamLinks, status, matchId }: { streamLinks: string[] | null; status: string; matchId: string }) {
  const hasLinks = streamLinks && streamLinks.length > 0
  const isUpcoming = status === 'upcoming'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Watch Live
        </h2>
      </div>

      {/* Telegram Channel Link */}
      <a
        href="https://t.me/kdottv"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center gap-3 rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 p-4 text-white transition-transform hover:scale-[1.02] hover:shadow-lg"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.11-.04-.16-.05-.05-.12-.03-.17-.02-.07.02-1.14.73-3.2 2.13-.3.21-.57.31-.82.31-.27 0-.53-.14-.77-.27l-.03-.02c-.54-.28-1.15-.6-1.15-1.18 0-.4.22-.62.63-.82l.05-.02c2.38-1.04 3.93-1.72 4.66-2.05.67-.3 1.29-.29 1.68-.17.42.13.76.43.82.84.05.35.12.7.14 1.05z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Join KdotTV Telegram Channel</p>
          <p className="text-sm text-white/80">Get instant match updates and notifications</p>
        </div>
        <ExternalLink className="h-5 w-5" />
      </a>

      {/* Stream Links */}
      {hasLinks ? (
        <div className="space-y-3">
          {streamLinks.map((link, index) => (
            <Link
              key={index}
              href={`/watch?url=${encodeURIComponent(link)}&match=${matchId}&n=${index}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-750"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Radio className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900 dark:text-white">Stream Link {index + 1} (HD)</p>
                {/* <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{link}</p> */}
              </div>
              <ExternalLink className="h-5 w-5 text-zinc-400" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <Trophy className="mx-auto h-12 w-12 text-zinc-400 mb-3" />
          <p className="text-lg font-medium text-zinc-900 dark:text-white">
            {isUpcoming ? 'Links will be available when match is about to start' : 'Match Has Ended'}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isUpcoming ? 'Links will be available soon..' : 'No stream links available for this match'}
          </p>
        </div>
      )}
    </div>
  )
}

async function MatchDetailContent({ id }: { id: string }) {
  const data = await getMatchDetails(id)
  
  if (!data) {
    notFound()
  }
  
  const { match, team1Data, team2Data, leagueData } = data
  const team1Name = team1Data?.name || match.team1
  const team2Name = team2Data?.name || match.team2
  const formattedTime = formatMatchTime(match.match_date, match.display_time)
  
  return (
    <div className="space-y-6">
      {/* Match Card Header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Teams VS */}
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          <TeamDisplay 
            teamSlug={match.team1} 
            teamData={team1Data} 
            score={match.team1_score}
          />
          
          <div className="flex flex-col items-center gap-2">
            <MatchStatusBadge
              status={match.status}
              matchDate={match.match_date}
              displayTime={match.display_time}
              durationHours={Number(
                (match.raw_data as { duration?: number } | null)?.duration ?? 2,
              )}
              size="md"
            />
            <span className="text-2xl font-black text-zinc-300 dark:text-zinc-600">VS</span>
            {formattedTime && (
              <span className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                {formattedTime}
              </span>
            )}
            <MatchTimer
              status={match.status}
              matchDate={match.match_date}
              displayTime={match.display_time}
              durationHours={Number(
                (match.raw_data as { duration?: number } | null)?.duration ?? 2,
              )}
              size="md"
            />
          </div>
          
          <TeamDisplay 
            teamSlug={match.team2} 
            teamData={team2Data} 
            score={match.team2_score}
          />
        </div>
        
        {/* League Info */}
        {leagueData && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Trophy className="h-4 w-4" />
            <span>{leagueData.name}</span>
          </div>
        )}
      </div>
      
      {/* Match Info Section */}
      <div className="rounded-2xl border border-zinc-200 bg-linear-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Match Details
          </h2>
        </div>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-lg">
            {generateMatchInfo(match, team1Name, team2Name, leagueData?.name || null)}
          </p>
        </div>
        
      </div>
      
      {/* Stream Links Section */}
      <StreamLinksSection streamLinks={match.stream_links} status={match.status} matchId={match.id} />
      
      {/* Lineup Info Section */}
      <LineupInfoSection />
      
      {/* FAQ Section */}
      <FAQSection 
        team1Name={team1Name} 
        team2Name={team2Name} 
        leagueName={leagueData?.name || null}
        matchDate={match.match_date}
      />
    </div>
  )
}

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getMatchDetails(id)
  
  if (!data) {
    return {
      title: 'Match Not Found - kdotTV',
    }
  }
  
  const { match, team1Data, team2Data, leagueData } = data
  const team1Name = team1Data?.name || match.team1
  const team2Name = team2Data?.name || match.team2
  
  const title = `${team1Name} vs ${team2Name} - Watch Live HD`
  const description = `Watch ${team1Name} vs ${team2Name} live in HD${leagueData ? ` in ${leagueData.name}` : ''}. Stream the match online for free on kdotTV.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://kdotv.com/match/${id}`,
      images: [
        {
          url: `/match/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${team1Name} vs ${team2Name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/match/${id}/opengraph-image`],
    },
  }
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params
  
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 transition-colors dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Back Button */}
          <Link 
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Link>
          
          {/* Bulletin Banner */}
          <div className="mb-6">
            <BulletinBanner />
          </div>

          {/* Match Detail Content */}
          <Suspense fallback={
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-48 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          }>
            <MatchDetailContent id={id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
