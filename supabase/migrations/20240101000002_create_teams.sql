-- Teams table. Populated by the scraper (best-effort enrichment from
-- SofaScore's public search API for new teams).

CREATE TABLE IF NOT EXISTS teams (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  sport         TEXT NOT NULL DEFAULT 'football',
  country       TEXT,
  short_name    TEXT,
  logo_url      TEXT,
  sofascore_id  BIGINT UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_slug         ON teams (slug);
CREATE INDEX IF NOT EXISTS idx_teams_sport        ON teams (sport);
CREATE INDEX IF NOT EXISTS idx_teams_sofascore_id ON teams (sofascore_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read teams"      ON teams;
DROP POLICY IF EXISTS "Service role can write teams" ON teams;

CREATE POLICY "Public can read teams"
  ON teams FOR SELECT USING (true);

CREATE POLICY "Service role can write teams"
  ON teams FOR ALL USING (auth.role() = 'service_role');
