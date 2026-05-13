import type { MetadataRoute } from 'next'

const BASE_URL = 'https://kdotv.com'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${BASE_URL}/cricket`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ]

  // Only generate dynamic routes if Supabase environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not found, returning static routes only')
    return staticRoutes
  }

  try {
    const { supabase } = await import('@/lib/supabase')
    
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

    const { data: matches } = await supabase
      .from('matches')
      .select('id, status, match_date')
      .or(`status.in.(live,upcoming),and(status.eq.ended,match_date.gt.${threeDaysAgo})`)

    const matchRoutes: MetadataRoute.Sitemap = (matches ?? []).map((m) => ({
      url: `${BASE_URL}/match/${m.id}`,
      lastModified: m.match_date ? new Date(m.match_date) : new Date(),
      changeFrequency: m.status === 'live' ? 'always' : 'hourly',
      priority: m.status === 'live' ? 0.95 : m.status === 'upcoming' ? 0.85 : 0.6,
    }))

    return [...staticRoutes, ...matchRoutes]
  } catch (error) {
    console.error('Failed to generate match routes for sitemap:', error)
    return staticRoutes
  }
}
