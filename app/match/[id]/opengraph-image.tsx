import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge'

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
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />
        {/* Live Badge */}
        {isLive && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '2px',
              }}
            >
              LIVE
            </span>
          </div>
        )}

        {/* kdotTV Logo/Branding */}
        <div
          style={{
            marginBottom: '40px',
            fontSize: '32px',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '1px',
            zIndex: 10,
            position: 'relative',
          }}
        >
          kdot<span style={{ color: '#ef4444' }}>TV</span>
        </div>

        {/* Teams and VS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            marginBottom: '40px',
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
              gap: '20px',
            }}
          >
            {team1Data?.logo_url ? (
              <img
                src={team1Data.logo_url}
                alt={team1Name}
                width={120}
                height={120}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                {team1Name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                textAlign: 'center',
                maxWidth: '200px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {team1Name}
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#ef4444',
                letterSpacing: '4px',
                textShadow: '0 2px 10px rgba(239, 68, 68, 0.5)',
              }}
            >
              VS
            </div>
            <div
              style={{
                width: '4px',
                height: '80px',
                backgroundColor: '#333333',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* Team 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {team2Data?.logo_url ? (
              <img
                src={team2Data.logo_url}
                alt={team2Name}
                width={120}
                height={120}
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                {team2Name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: '#ffffff',
                fontSize: '28px',
                fontWeight: '700',
                textAlign: 'center',
                maxWidth: '200px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {team2Name}
            </div>
          </div>
        </div>

        {/* Watch Live HD */}
        <div
          style={{
            marginTop: '30px',
            padding: '16px 48px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
            zIndex: 10,
            position: 'relative',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: '800',
              letterSpacing: '2px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            WATCH LIVE HD
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#888888',
            fontWeight: '500',
            zIndex: 10,
          }}
        >
          kdotv.com
        </div>
      </div>
    ),
    size
  )
}
