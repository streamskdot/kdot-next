#!/usr/bin/env node
/**
 * Scraper for https://www.yosintv.net/football.html
 *
 * Changelog (fixes vs previous version):
 *   - scrapeDom() rewritten to parse the new FotMob-style card layout
 *     (.match-card a → .match-team.home/.away, data-time, data-duration,
 *     .match-local-time, .match-league-bar p, .match-status-* classes).
 *   - extractMatchesFromJson() now also checks `match_time` and `kickoff`
 *     as ISO date sources so match_date is populated from the API payload.
 *   - Both paths now capture details_url for stream-link enrichment.
 *   - Duplicate suppression: makeMatchId uses the UTC date from data-time
 *     so the same fixture always hashes to the same id regardless of run.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// --------------------------- terminal colors ---------------------------
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m',
  white: '\x1b[37m', gray: '\x1b[90m',
  bgRed: '\x1b[41m', bgGreen: '\x1b[42m', bgYellow: '\x1b[43m', bgBlue: '\x1b[44m',
};

const ICON = {
  rocket: '🚀', globe: '🌐', search: '🔍', database: '🗄️ ',
  soccer: '⚽', trophy: '🏆', teams: '👥', check: '✅',
  warn: '⚠️ ', error: '❌', sparkles: '✨', clock: '⏱️ ',
  package: '📦', trash: '🗑️ ', link: '🔗', chart: '📊', arrow: '➜',
};

function timestamp() {
  const now = new Date();
  return `${C.gray}[${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}]${C.reset}`;
}

function log(level, icon, message, detail = '') {
  const colors = { info: C.cyan, success: C.green, warn: C.yellow, error: C.red, step: C.magenta, api: C.blue };
  const color = colors[level] || C.white;
  const detailStr = detail ? ` ${C.dim}${detail}${C.reset}` : '';
  console.log(`${timestamp()} ${color}${icon}${C.reset} ${message}${detailStr}`);
}

function header(title) {
  const line = '─'.repeat(50);
  console.log(`\n${C.cyan}${C.bold}${line}${C.reset}`);
  console.log(`${C.cyan}${C.bold}  ${ICON.rocket} ${title}${C.reset}`);
  console.log(`${C.cyan}${C.bold}${line}${C.reset}\n`);
}

function section(title) { console.log(`\n${C.magenta}${C.bold}┏━━ ${title} ━━${C.reset}`); }
function subsection(title) { console.log(`${C.magenta}${C.bold}┃${C.reset} ${C.dim}${title}${C.reset}`); }
function sectionEnd() { console.log(`${C.magenta}${C.bold}┗${'━'.repeat(48)}${C.reset}\n`); }

function statRow(label, value, color = C.cyan) {
  const padding = ' '.repeat(Math.max(0, 20 - label.length));
  console.log(`  ${C.gray}${label}:${padding}${C.reset}${color}${value}${C.reset}`);
}

function matchRow(match, index) {
  const statusColors = { live: C.bgRed + C.white, ended: C.gray, upcoming: C.yellow };
  const statusIcon = match.status === 'live' ? '●' : match.status === 'ended' ? '○' : '◌';
  const statusColor = statusColors[match.status] || C.white;
  const scoreStr = match.team1_score != null && match.team2_score != null
    ? `${C.bold}${match.team1_score} - ${match.team2_score}${C.reset}`
    : `${C.dim}vs${C.reset}`;
  console.log(`    ${C.gray}${String(index).padStart(2)}.${C.reset} ${statusColor}${statusIcon}${C.reset} ${C.white}${match.team1}${C.reset} ${scoreStr} ${C.white}${match.team2}${C.reset}`);
  console.log(`        ${C.dim}${ICON.trophy} ${match.league_name || 'Unknown League'}${C.reset}`);
  if (match.display_time) console.log(`        ${C.dim}${ICON.clock} ${match.display_time}${C.reset}`);
}

// Load .env.local for local runs (CI already has env set).
(function loadEnvLocal() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, '../.env.local'),
    path.resolve(process.cwd(), '.env.local'),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    break;
  }
})();

const TARGET_URL = 'https://www.yosintv.net/football.html';
const NAV_TIMEOUT_MS = 45_000;
const SETTLE_MS = 6_000;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// --------------------------- helpers ---------------------------------

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function makeMatchId(leagueSlug, team1, team2, matchDate) {
  const dateKey = matchDate ? new Date(matchDate).toISOString().slice(0, 10) : '';
  return sha256([leagueSlug, team1, team2, dateKey].join('|'));
}

function classifyStatus(text, hasScore, startIso = null, durationHours = null) {
  if (startIso) {
    const start = new Date(startIso);
    if (!Number.isNaN(start.getTime())) {
      const hours = Number.isFinite(durationHours) ? Number(durationHours) : 2;
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      const now = new Date();
      if (now > end) return 'ended';
      if (now >= start && now <= end) return 'live';
      return 'upcoming';
    }
  }
  const t = String(text || '').toLowerCase();
  if (/\b(live|hd|playing|1st|2nd|half[- ]?time|ht|ft\?)\b/.test(t)) return 'live';
  if (/\b(ended|final|ft|full[- ]?time|finished|result)\b/.test(t)) return 'ended';
  if (/\b(upcoming|scheduled|starts?|preview|vs)\b/.test(t)) return 'upcoming';
  if (hasScore) return 'live';
  return 'upcoming';
}

function normalizeTeam(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function parseScore(s) {
  if (s == null) return null;
  const m = String(s).match(/^\s*(\d{1,3})\s*$/);
  return m ? m[1] : null;
}

/**
 * Try to resolve a raw date value to an ISO string.
 * Handles ISO strings with timezone offsets (e.g. "2026-05-16T23:30:00+09:00").
 */
function resolveDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Extract matches from arbitrary JSON.
 * Now also checks `match_time` and `kickoff` as ISO date sources.
 */
function extractMatchesFromJson(node, out = []) {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const v of node) extractMatchesFromJson(v, out);
    return out;
  }
  if (typeof node === 'object') {
    const keys = Object.keys(node);
    const lower = keys.map((k) => k.toLowerCase());

    const team1Key = keys[lower.findIndex((k) => /^(team1|home|hometeam|home_team|t1)$/.test(k))];
    const team2Key = keys[lower.findIndex((k) => /^(team2|away|awayteam|away_team|t2)$/.test(k))];

    if (team1Key && team2Key) {
      const team1 = normalizeTeam(node[team1Key]?.name ?? node[team1Key]);
      const team2 = normalizeTeam(node[team2Key]?.name ?? node[team2Key]);
      if (team1 && team2) {
        const leagueName =
          node.league?.name ?? node.league_name ?? node.competition ??
          node.tournament ?? node.league ?? '';

        const score1 = parseScore(
          node.team1_score ?? node.home_score ?? node.score?.home ??
          node.score1 ?? node[team1Key]?.score,
        );
        const score2 = parseScore(
          node.team2_score ?? node.away_score ?? node.score?.away ??
          node.score2 ?? node[team2Key]?.score,
        );

        const statusRaw = node.status ?? node.state ?? node.match_status ?? '';

        // ---- FIX: expanded date field list to include match_time & kickoff ----
        const startRaw =
          node.start ?? node.match_date ?? node.date ?? node.start_at ??
          node.kickoff_at ?? node.match_time ?? node.kickoff ?? null;
        // -----------------------------------------------------------------------

        const durationHours = Number.isFinite(Number(node.duration)) ? Number(node.duration) : 2;

        let matchDate = null;
        let displayTime = node.display_time ?? node.time ?? node.start_time ?? '';
        let startIso = null;

        if (startRaw) {
          const iso = resolveDate(startRaw);
          if (iso) {
            matchDate = iso;
            startIso = iso;
            const d = new Date(iso);
            const hh = String(d.getUTCHours()).padStart(2, '0');
            const mm = String(d.getUTCMinutes()).padStart(2, '0');
            // Only overwrite displayTime if it's empty or looks non-human-readable
            if (!displayTime || !/\d{1,2}:\d{2}/.test(String(displayTime))) {
              displayTime = `${hh}:${mm}`;
            }
          }
        }

        const team1Logo = node.team1_logo ?? node[team1Key]?.logo ?? node[team1Key]?.image ?? null;
        const team2Logo = node.team2_logo ?? node[team2Key]?.logo ?? node[team2Key]?.image ?? null;
        const detailsUrl = node.details_url ?? node.url ?? node.match_url ?? null;

        out.push({
          league_name: String(leagueName || '').trim(),
          team1,
          team2,
          team1_logo: team1Logo || null,
          team2_logo: team2Logo || null,
          team1_score: score1,
          team2_score: score2,
          status: classifyStatus(
            statusRaw || displayTime,
            score1 != null || score2 != null,
            startIso,
            durationHours,
          ),
          display_time: String(displayTime || '').trim() || null,
          match_date: matchDate,
          raw_data: { ...node, details_url: detailsUrl },
        });
      }
    }
    for (const k of keys) extractMatchesFromJson(node[k], out);
  }
  return out;
}

// --------------------------- scrape ----------------------------------

async function scrape() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
  });
  const page = await context.newPage();

  /** @type {Array<{url: string, json: any}>} */
  const jsonResponses = [];
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      const ct = (resp.headers()['content-type'] || '').toLowerCase();
      const reqType = resp.request().resourceType();
      if (!ct.includes('json') && !['xhr', 'fetch'].includes(reqType)) return;
      if (/google-analytics|doubleclick|gstatic|fonts|adsystem|recaptcha/i.test(url)) return;
      const text = await resp.text();
      if (!text || text.length > 4_000_000) return;
      let parsed;
      try { parsed = JSON.parse(text); } catch { return; }
      jsonResponses.push({ url, json: parsed });
    } catch { /* ignore */ }
  });

  section('BROWSER');
  log('step', ICON.globe, 'Navigating to target', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  try { await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }); } catch {}
  await page.waitForTimeout(SETTLE_MS);

  // 1) Try API responses
  let matches = [];
  let apiSources = 0;
  for (const { url, json } of jsonResponses) {
    const found = extractMatchesFromJson(json);
    if (found.length) {
      apiSources++;
      log('api', ICON.link, `API source #${apiSources}`, `${found.length} matches from ${url.slice(0, 80)}`);
      matches.push(...found);
    }
  }

  // 2) Always run DOM scraping (as a supplement or fallback)
  //    The new card-based DOM scraper is authoritative for display_time &
  //    match_date when the API payload is missing them.
  log('step', ICON.search, 'Running DOM scraper for card-based layout');
  const domMatches = await scrapeDom(page);

  if (matches.length === 0) {
    log('warn', ICON.warn, 'No API matches — using DOM results exclusively');
    matches = domMatches;
  } else {
    // Merge: DOM results carry data-time dates & display_time that the API
    // JSON may have as match_time. We trust the API for most fields but
    // back-fill any missing match_date / display_time from DOM.
    log('success', ICON.check,
      `API: ${matches.length} match(es) | DOM: ${domMatches.length} match(es) — merging`);

    // Build a lookup from DOM by team slugs (no date — just for enrichment)
    const domByTeams = new Map();
    for (const dm of domMatches) {
      const key = `${slugify(dm.team1)}|${slugify(dm.team2)}`;
      domByTeams.set(key, dm);
    }

    for (const m of matches) {
      if (m.match_date && m.display_time) continue; // already complete
      const key = `${slugify(m.team1)}|${slugify(m.team2)}`;
      const dm = domByTeams.get(key);
      if (!dm) continue;
      if (!m.match_date && dm.match_date) m.match_date = dm.match_date;
      if (!m.display_time && dm.display_time) m.display_time = dm.display_time;
      if (!m.raw_data?.details_url && dm.raw_data?.details_url) {
        m.raw_data = { ...(m.raw_data || {}), details_url: dm.raw_data.details_url };
      }
    }
  }

  // 3) Enrich with stream links
  try {
    await enrichWithStreamLinks(matches, context);
  } catch (e) {
    log('warn', ICON.warn, 'Stream link enrichment failed', e?.message || e);
  }

  await browser.close();
  return matches;
}

// -------------------- DOM scraper (rewritten for new card layout) --------------------

/**
 * Scrapes the FotMob-style card layout used by yosintv.net as of May 2026.
 *
 * Each match is an <a class="match-card"> with:
 *   data-time  = ISO-8601 kickoff with tz offset  (e.g. 2026-05-16T23:30:00+09:00)
 *   data-duration = match duration in hours        (e.g. 2.2)
 *   href       = details page URL
 *
 * Inside:
 *   .match-team.home .match-team-name  → home team name
 *   .match-team.home img               → home team logo src
 *   .match-team.away .match-team-name  → away team name
 *   .match-team.away img               → away team logo src
 *   .match-center .match-local-time    → local time string (e.g. "8:15 PM")
 *   .match-status                      → class tells status:
 *       match-status-live | match-status-countdown | match-status-over
 *   .match-league-bar p                → league / competition name
 */
async function scrapeDom(page) {
  return await page.evaluate(() => {
    const cards = document.querySelectorAll('a.match-card');
    const out = [];
    const seen = new Set(); // deduplicate within DOM (site sometimes renders dupes)

    for (const card of cards) {
      // Team names
      const team1El = card.querySelector('.match-team.home .match-team-name');
      const team2El = card.querySelector('.match-team.away .match-team-name');
      if (!team1El || !team2El) continue;

      const team1 = (team1El.textContent || '').replace(/\s+/g, ' ').trim();
      const team2 = (team2El.textContent || '').replace(/\s+/g, ' ').trim();
      if (!team1 || !team2 || team1.toLowerCase() === team2.toLowerCase()) continue;

      // Deduplicate within page (Al-Nassr bug)
      const dataTime = card.dataset?.time || '';
      const dedupeKey = `${team1}|${team2}|${dataTime}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      // Team logos
      const team1LogoEl = card.querySelector('.match-team.home img');
      const team2LogoEl = card.querySelector('.match-team.away img');
      const team1_logo = team1LogoEl?.src || null;
      const team2_logo = team2LogoEl?.src || null;

      // League
      const leagueEl = card.querySelector('.match-league-bar p');
      const league_name = (leagueEl?.textContent || '').trim();

      // Display time (local clock shown on card)
      const timeEl = card.querySelector('.match-local-time');
      const display_time = (timeEl?.textContent || '').trim() || null;

      // Match date from data-time (ISO with tz offset — fully parseable)
      let match_date = null;
      if (dataTime) {
        const d = new Date(dataTime);
        if (!Number.isNaN(d.getTime())) match_date = d.toISOString();
      }

      const duration = parseFloat(card.dataset?.duration) || 2;

      // Status from CSS class
      const statusEl = card.querySelector('.match-status');
      let status = 'upcoming';
      if (statusEl) {
        if (statusEl.classList.contains('match-status-live')) status = 'live';
        else if (statusEl.classList.contains('match-status-over')) status = 'ended';
        // match-status-countdown → upcoming (default)
      }

      // Details URL
      const details_url = card.href || null;

      out.push({
        league_name,
        team1,
        team2,
        team1_logo,
        team2_logo,
        team1_score: null,
        team2_score: null,
        status,
        display_time,
        match_date,
        raw_data: { source: 'dom', details_url, duration },
      });
    }

    return out;
  });
}

// --------------------------- stream link enrichment -----------------

async function enrichWithStreamLinks(matches, context) {
  section('STREAM LINKS');
  const withUrl = matches.filter((m) => m?.raw_data?.details_url);
  if (!withUrl.length) {
    log('info', ICON.link, 'No matches have a details_url — skipping enrichment');
    sectionEnd();
    return;
  }
  log('step', ICON.link, `Enriching ${withUrl.length} match(es) with stream links`, 'max 3 concurrent');

  const CONCURRENCY = 3;
  let cursor = 0;
  let enrichedCount = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= withUrl.length) return;
      const match = withUrl[idx];
      const detailsUrl = match.raw_data.details_url;
      let pg;
      try {
        pg = await context.newPage();
        try {
          await pg.goto(detailsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await pg.waitForSelector('#live-container a, .live-container a', { timeout: 10000 });
        } catch {
          match.stream_links = null;
          return;
        }
        const hrefs = await pg.$$eval(
          '#live-container a, .live-container a',
          (els) => els.map((a) => a.getAttribute('href')).filter(Boolean),
        );
        const links = [];
        for (const href of hrefs) {
          try {
            const qIdx = href.indexOf('?');
            const query = qIdx >= 0 ? href.slice(qIdx + 1) : '';
            const params = new URLSearchParams(query);
            const raw = params.get('url');
            if (raw) links.push(decodeURIComponent(raw));
          } catch { /* skip malformed */ }
        }
        if (links.length) {
          match.stream_links = links.map((link) => ({ source: 'yosintv', link }));
          enrichedCount++;
        } else {
          match.stream_links = null;
        }
      } catch {
        match.stream_links = null;
      } finally {
        if (pg) { try { await pg.close(); } catch { /* ignore */ } }
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, withUrl.length) }, () => worker());
  await Promise.all(workers);

  log('success', ICON.link, 'Stream links enriched', `${enrichedCount}/${withUrl.length} matches have links`);
  sectionEnd();
}

// --------------------------- persistence -----------------------------

async function loadLeagueMap() {
  const map = new Map();
  try {
    const { data, error } = await supabase.from('leagues').select('name, slug, sport');
    if (error) {
      log('warn', ICON.warn, 'Could not load leagues table', error.message);
    } else if (Array.isArray(data)) {
      for (const row of data) {
        if (!row?.name) continue;
        map.set(String(row.name).toLowerCase().trim(), {
          slug: row.slug || slugify(row.name),
          sport: row.sport || 'football',
        });
      }
      log('success', ICON.trophy, `Loaded ${map.size} leagues from database`);
    }
  } catch (e) {
    log('warn', ICON.warn, 'Leagues table lookup failed', e?.message || e);
  }
  return map;
}

async function loadExistingTeams() {
  const map = new Map();
  try {
    const { data, error } = await supabase.from('teams').select('slug, logo_url');
    if (error) { log('warn', ICON.warn, 'Could not load teams table', error.message); return map; }
    for (const row of data || []) if (row?.slug) map.set(row.slug, { logo_url: row.logo_url });
    log('success', ICON.teams, `Loaded ${map.size} existing teams from database`);
  } catch (e) {
    log('warn', ICON.warn, 'Teams table lookup failed', e?.message || e);
  }
  return map;
}

async function ensureLeagues(leagueRefs) {
  const rows = [];
  for (const [slug, info] of leagueRefs) {
    rows.push({ name: info.name, slug, sport: info.sport || 'football' });
  }
  if (!rows.length) return;
  const { error } = await supabase.from('leagues').upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });
  if (error) { log('error', ICON.error, 'League upsert failed', error.message); throw error; }
  log('success', ICON.trophy, `Ensured ${rows.length} league(s) exist`);
}

async function ensureTeams(teamRefs, existingTeams) {
  const now = new Date().toISOString();
  const toInsert = [];
  const toBackfillLogo = [];

  for (const [slug, ref] of teamRefs) {
    const prev = existingTeams.get(slug);
    if (!prev) {
      toInsert.push({ name: ref.name, slug, sport: ref.sport || 'football', logo_url: ref.logo_url || null, updated_at: now });
    } else if (!prev.logo_url && ref.logo_url) {
      toBackfillLogo.push({ slug, logo_url: ref.logo_url });
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from('teams').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { log('error', ICON.error, 'Teams insert failed', error.message); throw error; }
    log('success', ICON.check, `Inserted ${toInsert.length} new team(s)`);
  } else {
    log('info', ICON.teams, 'No new teams to insert');
  }

  if (toBackfillLogo.length) {
    for (const u of toBackfillLogo) {
      const { error } = await supabase.from('teams')
        .update({ logo_url: u.logo_url, updated_at: now })
        .eq('slug', u.slug)
        .is('logo_url', null);
      if (error) console.warn(`Logo backfill failed for ${u.slug}:`, error.message);
    }
    log('success', ICON.sparkles, `Backfilled logos for ${toBackfillLogo.length} team(s)`);
  }
}

async function persist(matches) {
  section('PERSISTENCE');
  if (!matches.length) {
    log('warn', ICON.warn, 'No matches to persist');
    sectionEnd();
    return;
  }
  log('info', ICON.soccer, `Preparing to persist ${matches.length} match(es)`);

  subsection('Loading reference data...');
  const leagueMap = await loadLeagueMap();
  const now = new Date().toISOString();

  const leagueRefs = new Map();
  const teamRefs   = new Map();
  const enriched   = [];

  for (const m of matches) {
    const leagueName = (m.league_name || 'Unknown').trim() || 'Unknown';
    const known      = leagueMap.get(leagueName.toLowerCase());
    const leagueSlug = known?.slug || slugify(leagueName);
    const sport      = known?.sport || 'football';

    if (!leagueRefs.has(leagueSlug)) leagueRefs.set(leagueSlug, { name: leagueName, sport });

    const t1Name = m.team1;
    const t2Name = m.team2;
    const t1Slug = slugify(t1Name);
    const t2Slug = slugify(t2Name);
    if (!t1Slug || !t2Slug) continue;

    const prev1 = teamRefs.get(t1Slug);
    if (!prev1) teamRefs.set(t1Slug, { name: t1Name, sport, logo_url: m.team1_logo || null });
    else if (!prev1.logo_url && m.team1_logo) prev1.logo_url = m.team1_logo;

    const prev2 = teamRefs.get(t2Slug);
    if (!prev2) teamRefs.set(t2Slug, { name: t2Name, sport, logo_url: m.team2_logo || null });
    else if (!prev2.logo_url && m.team2_logo) prev2.logo_url = m.team2_logo;

    enriched.push({ m, leagueSlug, t1Slug, t2Slug });
  }

  subsection('Ensuring league records...');
  await ensureLeagues(leagueRefs);
  subsection('Loading & ensuring team records...');
  const existingTeams = await loadExistingTeams();
  await ensureTeams(teamRefs, existingTeams);

  // Build match rows — deduplicate by stable ID
  const byId = new Map();
  for (const { m, leagueSlug, t1Slug, t2Slug } of enriched) {
    const id = makeMatchId(leagueSlug, t1Slug, t2Slug, m.match_date);
    if (byId.has(id)) {
      // Merge stream_links only; prefer first occurrence for other fields
      const existingRow = byId.get(id);
      const existingLinks = Array.isArray(existingRow.stream_links) ? existingRow.stream_links : [];
      const newLinks = Array.isArray(m.stream_links) ? m.stream_links : [];
      if (newLinks.length) {
        const existingSet = new Set(existingLinks.map((l) => (typeof l === 'string' ? l : l.link)));
        existingRow.stream_links = [
          ...existingLinks,
          ...newLinks.filter((l) => !existingSet.has(typeof l === 'string' ? l : l.link)),
        ];
      }
      continue;
    }
    byId.set(id, {
      id,
      league: leagueSlug,
      team1: t1Slug,
      team2: t2Slug,
      team1_score: m.team1_score ?? null,
      team2_score: m.team2_score ?? null,
      status: m.status,
      display_time: m.display_time ?? null,
      match_date: m.match_date ?? null,
      scraped_at: now,
      raw_data: m.raw_data ?? null,
      stream_links: m.stream_links ?? null,
    });
  }

  const rows = Array.from(byId.values());
  log('step', ICON.database, `Upserting ${rows.length} unique match record(s)`);

  // Fetch existing rows to preserve ended_at, first_seen_at, stream_links
  const ids = rows.map((r) => r.id);
  const { data: existing, error: selErr } = await supabase
    .from('matches')
    .select('id, status, ended_at, first_seen_at, stream_links')
    .in('id', ids);
  if (selErr) log('warn', ICON.warn, 'Existing fetch failed (continuing)', selErr.message);
  const existingMap = new Map((existing || []).map((r) => [r.id, r]));

  for (const r of rows) {
    const prev = existingMap.get(r.id);
    r.ended_at    = r.status === 'ended' ? (prev?.ended_at || now) : (prev?.ended_at ?? null);
    r.first_seen_at = prev?.first_seen_at || now;

    // Merge stream_links: keep DB links + append any new scraped links
    const dbLinks     = Array.isArray(prev?.stream_links) ? prev.stream_links : [];
    const scrapedLinks = Array.isArray(r.stream_links)    ? r.stream_links    : [];
    if (dbLinks.length || scrapedLinks.length) {
      const dbSet = new Set(dbLinks.map((l) => (typeof l === 'string' ? l : l.link)));
      r.stream_links = [
        ...dbLinks,
        ...scrapedLinks.filter((l) => !dbSet.has(typeof l === 'string' ? l : l.link)),
      ];
    } else {
      r.stream_links = null;
    }
  }

  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('matches').upsert(chunk, { onConflict: 'id' });
    if (error) { console.error('Upsert error:', error.message); throw error; }
  }
  log('success', ICON.check, `Upserted ${rows.length} match(es)`);

  subsection('Running cleanup...');
  const { data: deleted, error: rpcErr } = await supabase.rpc('cleanup_old_matches');
  if (rpcErr) log('warn', ICON.warn, 'cleanup_old_matches RPC failed', rpcErr.message);
  else log('success', ICON.trash, `Cleanup deleted ${deleted ?? 0} stale row(s)`);
  sectionEnd();
}

// --------------------------- main ------------------------------------

(async () => {
  const start = Date.now();
  header('KDOT STREAMS SCRAPER');

  try {
    const matches = await scrape();

    section('SUMMARY');
    const duration = Date.now() - start;
    statRow('Total matches scraped', matches.length.toString(), C.green);
    statRow('Execution time', `${(duration / 1000).toFixed(2)}s`, C.cyan);

    if (matches.length > 0) {
      subsection('First 5 matches:');
      matches.slice(0, 5).forEach((m, i) => matchRow(m, i + 1));
      if (matches.length > 5) {
        console.log(`    ${C.dim}... and ${matches.length - 5} more${C.reset}`);
      }
    }

    await persist(matches);

    console.log(`\n${C.green}${C.bold}${ICON.check} Scraper completed successfully${C.reset}\n`);
    process.exit(0);
  } catch (e) {
    console.log(`\n${C.red}${C.bold}${ICON.error} SCRAPER FAILED${C.reset}`);
    console.log(`${C.red}${e?.message || e}${C.reset}\n`);
    process.exit(1);
  }
})();
