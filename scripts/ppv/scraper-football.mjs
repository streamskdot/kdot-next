#!/usr/bin/env node
/**
 * Scraper for https://ppv.to — Football section
 *
 * DOM layout (Vue/Nuxt):
 *   - Each match is an <a class="item-card" href="/live/{league}/{date}/{slug}">
 *   - h5 text: "Team1 vs. Team2"
 *   - .truncate: league name
 *   - .ml-auto span: countdown timer "1 day, 00:45:41" or live indicator "● 123"
 *   - img[src*="/assets/thumb/"]: thumbnail
 *   - Cards render twice (desktop hidden sm:block + mobile block sm:hidden)
 *
 * Strategy:
 *   - Deduplicate by href within the Football section.
 *   - Parse countdown → Date.now() + ms = match_date.
 *   - Cross-validate match_date with ISO date embedded in the href.
 *   - Live matches (●): status='live', match_date = URL date or now.
 *   - Stream link: full card href with https://ppv.to prefix, source='ppv'.
 *   - Thumbnail stored in raw_data.thumbnail (column must exist — add migration).
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
  bgRed: '\x1b[41m', bgGreen: '\x1b[42m',
};

const ICON = {
  rocket: '🚀', globe: '🌐', search: '🔍', database: '🗄️ ',
  soccer: '⚽', trophy: '🏆', teams: '👥', check: '✅',
  warn: '⚠️ ', error: '❌', sparkles: '✨', clock: '⏱️ ',
  link: '🔗', chart: '📊',
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
  console.log(`    ${C.gray}${String(index).padStart(2)}.${C.reset} ${statusColor}${statusIcon}${C.reset} ${C.white}${match.team1}${C.reset} ${C.dim}vs${C.reset} ${C.white}${match.team2}${C.reset}`);
  console.log(`        ${C.dim}${ICON.trophy} ${match.league_name || 'Unknown League'}${C.reset}`);
  if (match.display_time) console.log(`        ${C.dim}${ICON.clock} ${match.display_time}${C.reset}`);
}

// Load .env.local for local runs
(function loadEnvLocal() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, '../../.env.local'),
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

const TARGET_URL = 'https://ppv.to';
const NAV_TIMEOUT_MS = 45_000;
const SETTLE_MS = 8_000;
const SPORT = 'football';

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

function normalizeTeam(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

/**
 * Extract YYYY-MM-DD from href like /live/seriea/2026-05-17/como-par
 */
function extractUrlDate(href) {
  const m = String(href || '').match(/\/(\d{4}-\d{2}-\d{2})\//);
  return m ? m[1] : null;
}

/**
 * Parse ppv.to countdown timer text.
 * Formats: "HH:MM:SS" | "X day, HH:MM:SS" | "X days, HH:MM:SS" | "● 123" (live)
 */
function parseTimer(timerText, href) {
  const raw = String(timerText || '').trim();
  const urlDateStr = extractUrlDate(href);

  // Live indicator: ● 26  or  ● 1292
  if (/●/.test(raw)) {
    const viewers = raw.replace(/●/, '').trim();
    let matchDate;
    if (urlDateStr) {
      // Use URL date at current time (or midnight UTC if preferred)
      const d = new Date(urlDateStr + 'T00:00:00Z');
      // If that date is in the future, something's off; use now
      matchDate = d > new Date() ? new Date() : d;
    } else {
      matchDate = new Date();
    }
    return {
      status: 'live',
      display_time: viewers ? `LIVE (${viewers})` : 'LIVE',
      match_date: matchDate.toISOString(),
    };
  }

  // Countdown: "1 day, 00:45:41" or "00:45:41"
  const cdMatch = raw.match(/(?:(\d+)\s*day(?:s)?,?\s*)?(\d{1,2}):(\d{2}):(\d{2})/);
  if (cdMatch) {
    const days  = parseInt(cdMatch[1] || '0', 10);
    const hours = parseInt(cdMatch[2], 10);
    const mins  = parseInt(cdMatch[3], 10);
    const secs  = parseInt(cdMatch[4], 10);
    const totalMs = (((days * 24) + hours) * 60 + mins) * 60 * 1000 + secs * 1000;
    let matchDate = new Date(Date.now() + totalMs);

    // Cross-validate with URL date
    if (urlDateStr) {
      const urlDate = new Date(urlDateStr + 'T00:00:00Z');
      const diffHours = Math.abs(matchDate.getTime() - urlDate.getTime()) / (1000 * 60 * 60);
      if (diffHours > 36) {
        // Countdown drifted far from URL date — trust the URL date but preserve wall-clock time
        const hh = String(hours).padStart(2, '0');
        const mm = String(mins).padStart(2, '0');
        const ss = String(secs).padStart(2, '0');
        const iso = `${urlDateStr}T${hh}:${mm}:${ss}Z`;
        const fixed = new Date(iso);
        if (!Number.isNaN(fixed.getTime())) matchDate = fixed;
      }
    }

    return {
      status: 'upcoming',
      display_time: raw,
      match_date: matchDate.toISOString(),
    };
  }

  // Fallback — no recognisable timer
  let matchDate = null;
  if (urlDateStr) {
    const d = new Date(urlDateStr + 'T00:00:00Z');
    if (!Number.isNaN(d.getTime())) matchDate = d.toISOString();
  }
  return {
    status: 'upcoming',
    display_time: raw || null,
    match_date: matchDate,
  };
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

  section('BROWSER');
  log('step', ICON.globe, 'Navigating to target', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
  try { await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }); } catch {}

  // Scroll to Football section (#34) to trigger Vue lazy-loading
  log('step', ICON.search, 'Scrolling to Football section (#34)...');
  const footballSection = await page.locator('#34').first();
  if (await footballSection.isVisible().catch(() => false)) {
    await footballSection.scrollIntoViewIfNeeded();
  } else {
    // Fallback: scroll to the Football heading
    const footballHeading = await page.locator('h2:has-text("Football")').first();
    if (await footballHeading.isVisible().catch(() => false)) {
      await footballHeading.scrollIntoViewIfNeeded();
    }
  }
  await page.waitForTimeout(SETTLE_MS);

  // Give Vue a moment to hydrate cards if they were lazy-loaded
  await page.waitForTimeout(3_000);

  log('step', ICON.search, 'Scraping Football section DOM');

  // Diagnostics
  const diag = await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2'))
      .map((el) => ({ text: (el.textContent || '').trim(), id: el.closest('[id]')?.id || null }));
    const allCards = Array.from(document.querySelectorAll('a.item-card'))
      .map((a) => ({ href: a.getAttribute('href'), text: (a.querySelector('h5')?.textContent || '').trim() }));
    const footballSection = document.querySelector('#34');
    const footballCards = footballSection ? footballSection.querySelectorAll('a.item-card').length : 0;
    return { h2s: h2s.slice(0,15), allCards: allCards.slice(0,15), totalCards: allCards.length, footballCards };
  });
  log('info', ICON.search, 'Diagnostics', `totalCards=${diag.totalCards}, footballCards=${diag.footballCards}`);
  diag.h2s.forEach((h) => log('info', '', `  h2: "${h.text}"${h.id ? ' (id='+h.id+')' : ''}`));
  diag.allCards.forEach((c) => log('info', '', `  card: ${c.href} → "${c.text}"`));

  const matches = await scrapeDom(page);
  await browser.close();
  return matches;
}

async function scrapeDom(page) {
  // First wait for the Football section to have actual cards (not just placeholders)
  try {
    await page.waitForFunction(() => {
      const section = document.querySelector('#34');
      if (!section) return false;
      const cards = section.querySelectorAll('a.item-card');
      return cards.length > 0;
    }, { timeout: 20_000 });
  } catch {
    log('warn', ICON.warn, 'Football section (#34) did not populate with cards within 20s');
  }

  return await page.evaluate(() => {
    const section = document.querySelector('#34');
    if (!section) return [];

    const cards = section.querySelectorAll('a.item-card[href^="/live"]');
    const seen = new Set();
    const out = [];

    for (const card of cards) {
      const href = card.getAttribute('href');
      if (!href || seen.has(href)) continue;
      seen.add(href);

      // Teams: "Team1 vs. Team2"
      const h5 = card.querySelector('h5');
      const title = (h5?.textContent || '').trim();
      const vsIdx = title.toLowerCase().indexOf(' vs. ');
      if (vsIdx === -1) continue;
      const team1 = title.slice(0, vsIdx).trim();
      const team2 = title.slice(vsIdx + 5).trim();
      if (!team1 || !team2) continue;

      // League — .truncate span
      const leagueEl = card.querySelector('.truncate');
      const league_name = (leagueEl?.textContent || '').trim() || 'Unknown';

      // Thumbnail
      const img = card.querySelector('img');
      const thumbnail = img?.getAttribute('src') || null;

      // Timer — .ml-auto contains countdown or live indicator
      const timerEl = card.querySelector('.ml-auto');
      const timerText = (timerEl?.textContent || '').trim();

      out.push({
        href,
        team1,
        team2,
        league_name,
        thumbnail,
        timerText,
      });
    }

    return out;
  });
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
          sport: row.sport || SPORT,
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
    rows.push({ name: info.name, slug, sport: info.sport || SPORT });
  }
  if (!rows.length) return;
  const { error } = await supabase.from('leagues').upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });
  if (error) { log('error', ICON.error, 'League upsert failed', error.message); throw error; }
  log('success', ICON.trophy, `Ensured ${rows.length} league(s) exist`);
}

async function ensureTeams(teamRefs, existingTeams) {
  const now = new Date().toISOString();
  const toInsert = [];

  for (const [slug, ref] of teamRefs) {
    const prev = existingTeams.get(slug);
    if (!prev) {
      toInsert.push({ name: ref.name, slug, sport: ref.sport || SPORT, logo_url: ref.logo_url || null, updated_at: now });
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from('teams').upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) { log('error', ICON.error, 'Teams insert failed', error.message); throw error; }
    log('success', ICON.check, `Inserted ${toInsert.length} new team(s)`);
  } else {
    log('info', ICON.teams, 'No new teams to insert');
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
    const sport      = known?.sport || SPORT;

    if (!leagueRefs.has(leagueSlug)) leagueRefs.set(leagueSlug, { name: leagueName, sport });

    const t1Name = m.team1;
    const t2Name = m.team2;
    const t1Slug = slugify(t1Name);
    const t2Slug = slugify(t2Name);
    if (!t1Slug || !t2Slug) continue;

    if (!teamRefs.has(t1Slug)) teamRefs.set(t1Slug, { name: t1Name, sport, logo_url: null });
    if (!teamRefs.has(t2Slug)) teamRefs.set(t2Slug, { name: t2Name, sport, logo_url: null });

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
      // Merge stream_links: append ppv links if not already present
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
      team1_score: null,
      team2_score: null,
      status: m.status,
      display_time: m.display_time ?? null,
      match_date: m.match_date ?? null,
      scraped_at: now,
      raw_data: { ...m.raw_data, source: 'ppv' },
      stream_links: m.stream_links ?? null,
      thumbnail: m.thumbnail ?? null,
    });
  }

  const rows = Array.from(byId.values());
  log('step', ICON.database, `Upserting ${rows.length} unique match record(s)`);

  // Fetch existing rows to preserve ended_at, first_seen_at, stream_links
  const ids = rows.map((r) => r.id);
  const { data: existing, error: selErr } = await supabase
    .from('matches')
    .select('id, status, ended_at, first_seen_at, stream_links, thumbnail')
    .in('id', ids);
  if (selErr) log('warn', ICON.warn, 'Existing fetch failed (continuing)', selErr.message);
  const existingMap = new Map((existing || []).map((r) => [r.id, r]));

  for (const r of rows) {
    const prev = existingMap.get(r.id);
    r.ended_at    = r.status === 'ended' ? (prev?.ended_at || now) : (prev?.ended_at ?? null);
    r.first_seen_at = prev?.first_seen_at || now;

    // Merge stream_links: keep DB links + append any new scraped links
    const dbLinks      = Array.isArray(prev?.stream_links) ? prev.stream_links : [];
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

    // Preserve existing thumbnail if new scrape didn't find one
    if (!r.thumbnail && prev?.thumbnail) r.thumbnail = prev.thumbnail;
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
  else log('success', ICON.chart, `Cleanup deleted ${deleted ?? 0} stale row(s)`);
  sectionEnd();
}

// --------------------------- main ------------------------------------

(async () => {
  const start = Date.now();
  header('PPV.TO FOOTBALL SCRAPER');

  try {
    const rawMatches = await scrape();

    // Post-process timers outside the browser
    const matches = rawMatches.map((m) => {
      const timer = parseTimer(m.timerText, m.href);
      const streamUrl = `https://pooembed.eu/embed${m.href}`;
      return {
        league_name: m.league_name,
        team1: normalizeTeam(m.team1),
        team2: normalizeTeam(m.team2),
        team1_logo: null,
        team2_logo: null,
        team1_score: null,
        team2_score: null,
        status: timer.status,
        display_time: timer.display_time,
        match_date: timer.match_date,
        thumbnail: m.thumbnail,
        stream_links: [{ source: 'ppv', link: streamUrl }],
        raw_data: { href: m.href, thumbnail: m.thumbnail },
      };
    });

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
