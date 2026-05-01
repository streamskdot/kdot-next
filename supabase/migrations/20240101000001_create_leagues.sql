-- Leagues table. Seeded with common football/cricket leagues so the
-- scraper's slug map resolves correctly from day one.

CREATE TABLE IF NOT EXISTS leagues (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  sport       TEXT NOT NULL DEFAULT 'football',  -- 'football' | 'cricket'
  logo_url    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leagues_slug      ON leagues (slug);
CREATE INDEX IF NOT EXISTS idx_leagues_sport     ON leagues (sport);
CREATE INDEX IF NOT EXISTS idx_leagues_is_active ON leagues (is_active);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read leagues"      ON leagues;
DROP POLICY IF EXISTS "Service role can write leagues" ON leagues;

CREATE POLICY "Public can read leagues"
  ON leagues FOR SELECT USING (true);

CREATE POLICY "Service role can write leagues"
  ON leagues FOR ALL USING (auth.role() = 'service_role');

-- Seed common leagues so the slug map loads correctly from day one
INSERT INTO leagues (name, slug, sport, sort_order) VALUES
  ('Champions League',      'champions-league',       'football', 1),
  ('Premier League',        'premier-league',         'football', 2),
  ('La Liga',               'la-liga',                'football', 3),
  ('Serie A',               'serie-a',                'football', 4),
  ('Bundesliga',            'bundesliga',             'football', 5),
  ('Ligue 1',               'ligue-1',                'football', 6),
  ('Europa League',         'europa-league',          'football', 7),
  ('World Cup',             'world-cup',              'football', 8),
  ('Saudi Pro League',      'saudi-pro-league',       'football', 9),
  ('MLS',                   'mls',                    'football', 10),
  ('AFC Champions League',  'afc-champions-league',   'football', 11),
  ('IPL',                   'ipl',                    'cricket',  20),
  ('ICC World Cup',         'icc-world-cup',          'cricket',  21)
ON CONFLICT (name) DO NOTHING;
