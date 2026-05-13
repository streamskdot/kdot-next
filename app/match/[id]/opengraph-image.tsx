import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export const revalidate = 86400 // Cache for 24 hours to reduce edge requests

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

interface OpenGraphImageProps {
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

  return {
    match,
    team1Data: teamsMap.get(match.team1) ?? null,
    team2Data: teamsMap.get(match.team2) ?? null,
  }
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id } = await params
  const data = await getMatchDetails(id)

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            fontSize: 60,
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          Match Not Found
        </div>
      ),
      size
    )
  }

  const { match, team1Data, team2Data } = data
  const team1Name = team1Data?.name || match.team1
  const team2Name = team2Data?.name || match.team2
  const isLive = match.status === 'live'
  const isEnded = match.status === 'ended'
  const hasScores = match.team1_score && match.team2_score

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0f0f',
          backgroundImage: 'url(/ground.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '50px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
          }}
        />

        {/* Top bar with status and branding */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 48px',
            zIndex: 10,
          }}
        >
          {/* kdotTV branding */}
          <div
            style={{
              fontSize: '26px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '1px',
            }}
          >
            kdot<span style={{ color: '#ef4444' }}>TV</span>
          </div>

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              backgroundColor: isLive ? '#ef4444' : isEnded ? '#22c55e' : '#3b82f6',
              borderRadius: '999px',
              boxShadow: isLive
                ? '0 4px 20px rgba(239, 68, 68, 0.5)'
                : '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isLive && (
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                }}
              />
            )}
            <span
              style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {isLive ? 'LIVE' : isEnded ? 'ENDED' : 'UPCOMING'}
            </span>
          </div>
        </div>

        {/* Teams and VS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
            zIndex: 10,
            position: 'relative',
          }}
        >
          {/* Team 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              width: '280px',
            }}
          >
            {team1Data?.logo_url ? (
              <img
                src={team1Data.logo_url}
                alt={team1Name}
                width={140}
                height={140}
                style={{
                  width: '140px',
                  height: '140px',
                  objectFit: 'contain',
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                {team1Name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: '700',
                textAlign: 'center',
                maxWidth: '260px',
              }}
            >
              {team1Name}
            </div>
            {hasScores && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '40px',
                  fontWeight: '900',
                }}
              >
                {match.team1_score}
              </div>
            )}
          </div>

          {/* VS */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '52px',
                fontWeight: '900',
                color: '#ef4444',
                letterSpacing: '4px',
                textShadow: '0 2px 12px rgba(239, 68, 68, 0.6)',
              }}
            >
              VS
            </div>
            {hasScores && (
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '16px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                }}
              >
                FT
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              width: '280px',
            }}
          >
            {team2Data?.logo_url ? (
              <img
                src={team2Data.logo_url}
                alt={team2Name}
                width={140}
                height={140}
                style={{
                  width: '140px',
                  height: '140px',
                  objectFit: 'contain',
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                {team2Name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: '700',
                textAlign: 'center',
                maxWidth: '260px',
              }}
            >
              {team2Name}
            </div>
            {hasScores && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '40px',
                  fontWeight: '900',
                }}
              >
                {match.team2_score}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: '14px 40px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(239, 68, 68, 0.35)',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '800',
                letterSpacing: '2px',
              }}
            >
              WATCH LIVE HD
            </span>
          </div>
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            kdotv.com
          </span>
        </div>
      </div>
    ),
    size
  )
}
