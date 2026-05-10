import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Match = {
  id: string
  league: string
  team1: string
  team2: string
  team1_score: string | null
  team2_score: string | null
  status: 'live' | 'ended' | 'upcoming'
  display_time: string | null
  match_date: string | null
  stream_links: string[] | null
  raw_data: Record<string, unknown> | null
  is_highlighted: boolean | null
}

export type League = {
  id: string
  name: string
  slug: string
  sport: string
  logo_url: string | null
  is_active: boolean
  sort_order: number
}

export type Team = {
  id: string
  name: string
  slug: string
  logo_url: string | null
}
