#!/usr/bin/env node
/**
 * Scraper for https://yosintv.getemoji.online/
 *
 * Strategy:
 *   1. Open the page with Playwright (chromium, headless).
 *   2. Intercept XHR/fetch responses and look for a JSON API that contains
 *      match data. If found, parse those payloads directly.
 *   3. Fall back to DOM scraping (multiple selector strategies) looking for
 *      elements containing two team names separated by a "vs" token.
 *   4. Match league_name against rows already in Supabase `leagues` table
 *      (we resolve slug from there). Unknown leagues fall back to slugified
 *      league_name.
 *   5. Stable id = sha256(league_slug + '|' + team1 + '|' + team2 + '|' + match_date_iso).
 *   6. Upsert to Supabase with service-role key, then call the
 *      cleanup_old_matches() RPC.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// --------------------------- terminal colors ---------------------------
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const ICON = {
  rocket: '🚀',
  globe: '🌐',
  search: '🔍',
  database: '🗄️ ',
  soccer: '⚽',
  trophy: '🏆',
  teams: '👥',
  check: '✅',
  warn: '⚠️ ',
  error: '❌',
  sparkles: '✨',
  clock: '⏱️ ',
  package: '📦',
  trash: '🗑️ ',
  link: '🔗',
  chart: '📊',
  arrow: '➜',
};

function timestamp() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${C.gray}[${hh}:${mm}:${ss}]${C.reset}`;
}

function log(level, icon, message, detail = '') {
  const colors = {
    info: C.cyan,
    success: C.green,
    warn: C.yellow,
    error: C.red,
    step: C.magenta,
    api: C.blue,
  };
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

function section(title) {
  console.log(`\n${C.magenta}${C.bold}┏━━ ${title} ━━${C.reset}`);
}

function subsection(title) {
  console.log(`${C.magenta}${C.bold}┃${C.reset} ${C.dim}${title}${C.reset}`);
}

function sectionEnd() {
  console.log(`${C.magenta}${C.bold}┗${'━'.repeat(48)}${C.reset}\n`);
}

function statRow(label, value, color = C.cyan) {
  const padding = ' '.repeat(Math.max(0, 20 - label.length));
  console.log(`  ${C.gray}${label}:${padding}${C.reset}${color}${value}${C.reset}`);
}

function matchRow(match, index) {
  const statusColors = {
    live: C.bgRed + C.white,
    ended: C.gray,
    upcoming: C.yellow,
  };
  const statusIcon = match.status === 'live' ? '●' : match.status === 'ended' ? '○' : '◌';
  const statusColor = statusColors[match.status] || C.white;
  const scoreStr = match.team1_score != null && match.team2_score != null
    ? `${C.bold}${match.team1_score} - ${match.team2_score}${C.reset}`
    : `${C.dim}vs${C.reset}`;
  const league = match.league_name || 'Unknown League';
  console.log(`    ${C.gray}${String(index).padStart(2)}.${C.reset} ${statusColor}${statusIcon}${C.reset} ${C.white}${match.team1}${C.reset} ${scoreStr} ${C.white}${match.team2}${C.reset}`);
  console.log(`        ${C.dim}${ICON.trophy} ${league}${C.reset}`);
  if (match.display_time) {
    console.log(`        ${C.dim}${ICON.clock} ${match.display_time}${C.reset}`);
  }
}

// Load .env.local for local runs. In GitHub Actions the env is already set,
// so missing files are simply ignored.
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

const TARGET_URL = 'https://yosintv.getemoji.online/';
const NAV_TIMEOUT_MS = 45_000;
const SETTLE_MS = 6_000;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? `set (length: ${SUPABASE_URL.length})` : 'undefined/empty');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? `set (length: ${SERVICE_KEY.length})` : 'undefined/empty');
  console.error('Raw values:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL =', JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL));
  console.error('  SUPABASE_SERVICE_ROLE_KEY =', JSON.stringify(process.env.SUPABASE_SERVICE_ROLE_KEY));
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
  // Time-based classification when we have a start timestamp.
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
  // Fallback: text heuristics.
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

// Try to pull match-shaped objects out of arbitrary JSON
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
          node.league?.name ?? node.league_name ?? node.competition ?? node.tournament ?? node.league ?? '';
        const score1 =
          parseScore(node.team1_score ?? node.home_score ?? node.score?.home ?? node.score1 ?? node[team1Key]?.score);
        const score2 =
          parseScore(node.team2_score ?? node.away_score ?? node.score?.away ?? node.score2 ?? node[team2Key]?.score);
        const statusRaw = node.status ?? node.state ?? node.match_status ?? '';
        const startRaw =
          node.start ?? node.match_date ?? node.date ?? node.start_at ?? node.kickoff_at ?? null;
        const durationHours = Number.isFinite(Number(node.duration)) ? Number(node.duration) : 2;

        let matchDate = null;
        let displayTime = node.display_time ?? node.time ?? node.kickoff ?? node.start_time ?? '';
        let startIso = null;
        if (startRaw) {
          const d = new Date(startRaw);
          if (!Number.isNaN(d.getTime())) {
            matchDate = d.toISOString();
            startIso = matchDate;
            // HH:MM in UTC
            const hh = String(d.getUTCHours()).padStart(2, '0');
            const mm = String(d.getUTCMinutes()).padStart(2, '0');
            displayTime = `${hh}:${mm}`;
          }
        }

        const team1Logo =
          node.team1_logo ?? node[team1Key]?.logo ?? node[team1Key]?.image ?? null;
        const team2Logo =
          node.team2_logo ?? node[team2Key]?.logo ?? node[team2Key]?.image ?? null;

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
          raw_data: node,
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
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
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
      // Skip obvious noise
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
  // Let network/JS settle so XHRs fire
  try { await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }); } catch {}
  await page.waitForTimeout(SETTLE_MS);

  // 1) Try API responses
  let matches = [];
  let apiSources = 0;
  for (const { url, json } of jsonResponses) {
    const found = extractMatchesFromJson(json);
    if (found.length) {
      apiSources++;
      log('api', ICON.link, `API source #${apiSources}`, `${found.length} matches from ${url.slice(0, 60)}...`);
      matches.push(...found);
    }
  }

  // 2) Fallback to DOM scraping
  if (matches.length === 0) {
    log('warn', ICON.search, 'No API matches found — falling back to DOM scraping');
    matches = await scrapeDom(page);
  } else {
    log('success', ICON.check, `Found ${matches.length} matches from ${apiSources} API source(s)`);
  }

  // 3) Enrich each match with stream links from its details page
  try {
    await enrichWithStreamLinks(matches, context);
  } catch (e) {
    log('warn', ICON.warn, 'Stream link enrichment failed', e?.message || e);
  }

  await browser.close();
  return matches;
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
      let page;
      try {
        page = await context.newPage();
        try {
          await page.goto(detailsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          // The container is `<div id="live-container">` (id, not class) and is
          // populated asynchronously by client-side JS. Wait for an <a> child
          // to appear, which means the stream JSON has been fetched & rendered.
          await page.waitForSelector('#live-container a, .live-container a', { timeout: 10000 });
        } catch {
          match.stream_links = null;
          return;
        }
        const hrefs = await page.$$eval('#live-container a, .live-container a', (els) =>
          els.map((a) => a.getAttribute('href')).filter(Boolean),
        );
        const links = [];
        for (const href of hrefs) {
          try {
            // Parse query param `url=` from either absolute or relative hrefs
            const qIdx = href.indexOf('?');
            const query = qIdx >= 0 ? href.slice(qIdx + 1) : '';
            const params = new URLSearchParams(query);
            const raw = params.get('url');
            if (raw) links.push(decodeURIComponent(raw));
          } catch { /* skip malformed */ }
        }
        if (links.length) {
          match.stream_links = links.map(link => ({ source: 'yosintv', link }));
          enrichedCount++;
        } else {
          match.stream_links = null;
        }
      } catch {
        match.stream_links = null;
      } finally {
        if (page) {
          try { await page.close(); } catch { /* ignore */ }
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, withUrl.length) }, () => worker());
  await Promise.all(workers);

  log('success', ICON.link, 'Stream links enriched', `${enrichedCount}/${withUrl.length} matches have links`);
  sectionEnd();
}

async function scrapeDom(page) {
  return await page.evaluate(() => {
    const SEPARATORS = /\s+(?:vs\.?|v\.?|VS|–|—|-)\s+/i;
    const out = [];

    // Strategy A: any element whose direct text contains "vs"
    const candidates = new Set();
    const all = document.querySelectorAll('body *');
    for (const el of all) {
      const txt = (el.textContent || '').trim();
      if (!txt || txt.length > 400) continue;
      // Has " vs " in immediate-ish text and not too many child rows
      if (/\bvs\.?\b/i.test(txt) && el.children.length < 12) {
        candidates.add(el);
      }
    }

    // De-duplicate: prefer the smallest element wrapping the match
    const ordered = Array.from(candidates).sort(
      (a, b) => (a.textContent || '').length - (b.textContent || '').length,
    );

    const seen = new Set();
    for (const el of ordered) {
      // Skip if an ancestor already accepted (we want innermost)
      let skip = false;
      for (const acc of seen) if (acc.contains(el) || el.contains(acc)) { skip = true; break; }
      if (skip) continue;

      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;

      // Try to split out two team names from a single line containing "vs"
      const lineWithVs = text.split('\n').map((l) => l.trim()).find((l) => SEPARATORS.test(l)) || text;
      const parts = lineWithVs.split(SEPARATORS).map((p) => p.trim()).filter(Boolean);
      if (parts.length < 2) continue;

      const team1 = parts[0].replace(/^[^A-Za-z0-9]+/, '').slice(0, 80);
      const team2 = parts[1].replace(/[^A-Za-z0-9 .'-]+$/, '').slice(0, 80);
      if (!team1 || !team2 || team1.toLowerCase() === team2.toLowerCase()) continue;

      // League: try heading-like ancestor
      let leagueName = '';
      let cursor = el;
      for (let i = 0; i < 6 && cursor; i++) {
        const prev = cursor.previousElementSibling;
        if (prev) {
          const ptxt = (prev.innerText || prev.textContent || '').replace(/\s+/g, ' ').trim();
          if (ptxt && ptxt.length < 120 && !SEPARATORS.test(ptxt) && !/\bvs\b/i.test(ptxt)) {
            leagueName = ptxt;
            break;
          }
        }
        cursor = cursor.parentElement;
        if (cursor) {
          const heading = cursor.querySelector('h1,h2,h3,h4,h5,.league,.tournament,.competition,[class*="league"],[class*="title"]');
          if (heading) {
            const htxt = (heading.innerText || heading.textContent || '').trim();
            if (htxt && htxt.length < 120 && !SEPARATORS.test(htxt)) {
              leagueName = htxt;
              break;
            }
          }
        }
      }

      // Score: look for "1 - 2" / "1:2" patterns within the block
      let team1_score = null, team2_score = null;
      const scoreMatch = text.match(/\b(\d{1,2})\s*[-:–]\s*(\d{1,2})\b/);
      if (scoreMatch) { team1_score = scoreMatch[1]; team2_score = scoreMatch[2]; }

      // Status hints
      const lowered = text.toLowerCase();
      let status = 'upcoming';
      if (/\b(live|hd|playing|1st|2nd|half[- ]?time|ht)\b/.test(lowered)) status = 'live';
      else if (/\b(ended|final|ft|full[- ]?time|finished)\b/.test(lowered)) status = 'ended';
      else if (team1_score != null) status = 'live';

      // Display time: first hh:mm token
      const timeMatch = text.match(/\b(\d{1,2}:\d{2}(?:\s*(?:am|pm|AM|PM))?)\b/);
      const display_time = timeMatch ? timeMatch[1] : null;

      seen.add(el);
      out.push({
        league_name: leagueName,
        team1,
        team2,
        team1_score,
        team2_score,
        status,
        display_time,
        match_date: null,
        raw_data: { source: 'dom', text: text.slice(0, 500) },
      });
    }

    return out;
  });
}

// --------------------------- persistence -----------------------------

async function loadLeagueMap() {
  // lowercased name -> { slug, sport }
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
  // slug -> { logo_url }
  const map = new Map();
  try {
    const { data, error } = await supabase.from('teams').select('slug, logo_url');
    if (error) {
      log('warn', ICON.warn, 'Could not load teams table', error.message);
      return map;
    }
    for (const row of data || []) if (row?.slug) map.set(row.slug, { logo_url: row.logo_url });
    log('success', ICON.teams, `Loaded ${map.size} existing teams from database`);
  } catch (e) {
    log('warn', ICON.warn, 'Teams table lookup failed', e?.message || e);
  }
  return map;
}

async function ensureLeagues(leagueRefs) {
  // leagueRefs: Map<slug, {name, sport}>
  const rows = [];
  for (const [slug, info] of leagueRefs) {
    rows.push({
      name: info.name,
      slug,
      sport: info.sport || 'football',
    });
  }
  if (!rows.length) return;
  const { error } = await supabase
    .from('leagues')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true });
  if (error) {
    log('error', ICON.error, 'League upsert failed', error.message);
    throw error;
  }
  log('success', ICON.trophy, `Ensured ${rows.length} league(s) exist`);
}

async function ensureTeams(teamRefs, existingTeams) {
  // teamRefs: Map<slug, {name, sport, logo_url}>
  // existingTeams: Map<slug, {logo_url}>
  const now = new Date().toISOString();

  const toInsert = [];
  const toBackfillLogo = []; // existing rows missing a logo that we now have

  for (const [slug, ref] of teamRefs) {
    const prev = existingTeams.get(slug);
    if (!prev) {
      toInsert.push({
        name: ref.name,
        slug,
        sport: ref.sport || 'football',
        logo_url: ref.logo_url || null,
        updated_at: now,
      });
    } else if (!prev.logo_url && ref.logo_url) {
      toBackfillLogo.push({ slug, logo_url: ref.logo_url });
    }
  }

  if (toInsert.length) {
    const { error } = await supabase
      .from('teams')
      .upsert(toInsert, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) {
      log('error', ICON.error, 'Teams insert failed', error.message);
      throw error;
    }
    log('success', ICON.check, `Inserted ${toInsert.length} new team(s)`);
  } else {
    log('info', ICON.teams, 'No new teams to insert');
  }

  if (toBackfillLogo.length) {
    for (const u of toBackfillLogo) {
      const { error } = await supabase
        .from('teams')
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
  log('info', ICON.clock, `Reference data loaded at ${now.slice(11, 19)}`);

  // First pass: resolve leagueSlug + teamSlugs for each match,
  // and collect unique leagues/teams that need to exist.
  const leagueRefs = new Map();   // slug -> {name, sport}
  const teamRefs = new Map();     // slug -> {name, sport}
  const enriched = [];

  for (const m of matches) {
    const leagueName = (m.league_name || 'Unknown').trim() || 'Unknown';
    const known = leagueMap.get(leagueName.toLowerCase());
    const leagueSlug = known?.slug || slugify(leagueName);
    const sport = known?.sport || 'football';

    if (!leagueRefs.has(leagueSlug)) {
      leagueRefs.set(leagueSlug, { name: leagueName, sport });
    }

    const t1Name = m.team1;
    const t2Name = m.team2;
    const t1Slug = slugify(t1Name);
    const t2Slug = slugify(t2Name);
    if (!t1Slug || !t2Slug) continue;

    // First time we see a team, record name+sport+logo. If we see it again
    // later with a logo and didn't have one, fill it in.
    const prev1 = teamRefs.get(t1Slug);
    if (!prev1) {
      teamRefs.set(t1Slug, { name: t1Name, sport, logo_url: m.team1_logo || null });
    } else if (!prev1.logo_url && m.team1_logo) {
      prev1.logo_url = m.team1_logo;
    }

    const prev2 = teamRefs.get(t2Slug);
    if (!prev2) {
      teamRefs.set(t2Slug, { name: t2Name, sport, logo_url: m.team2_logo || null });
    } else if (!prev2.logo_url && m.team2_logo) {
      prev2.logo_url = m.team2_logo;
    }

    enriched.push({ m, leagueSlug, t1Slug, t2Slug });
  }

  // Ensure FK parents exist BEFORE inserting matches.
  subsection('Ensuring league records...');
  await ensureLeagues(leagueRefs);
  subsection('Loading & ensuring team records...');
  const existingTeams = await loadExistingTeams();
  await ensureTeams(teamRefs, existingTeams);

  // Build match rows
  const byId = new Map();
  for (const { m, leagueSlug, t1Slug, t2Slug } of enriched) {
    const id = makeMatchId(leagueSlug, t1Slug, t2Slug, m.match_date);
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
  log('step', ICON.database, `Upserting ${rows.length} match record(s)`);

  // ended_at transition handling
  const ids = rows.map((r) => r.id);
  const { data: existing, error: selErr } = await supabase
    .from('matches')
    .select('id, status, ended_at, first_seen_at, stream_links')
    .in('id', ids);
  if (selErr) log('warn', ICON.warn, 'Existing fetch failed (continuing)', selErr.message);
  const existingMap = new Map((existing || []).map((r) => [r.id, r]));

  for (const r of rows) {
    const prev = existingMap.get(r.id);
    r.ended_at = r.status === 'ended' ? (prev?.ended_at || now) : (prev?.ended_at ?? null);
    // Always set first_seen_at: preserve prior value on update, stamp now on insert.
    // Required because supabase-js upsert sends a uniform column set across the
    // batch, so omitting it on any row would clobber existing rows with NULL and
    // violate the NOT NULL constraint on matches.first_seen_at.
    r.first_seen_at = prev?.first_seen_at || now;
    
    // Merge stream links: preserve existing links and append new scraped links
    const existingLinks = prev?.stream_links && Array.isArray(prev.stream_links) ? prev.stream_links : [];
    const scrapedLinks = r.stream_links && Array.isArray(r.stream_links) ? r.stream_links : [];
    
    if (existingLinks.length > 0 || scrapedLinks.length > 0) {
      // Build set of existing link URLs to avoid duplicates
      const existingLinkSet = new Set(existingLinks.map(l => typeof l === 'string' ? l : l.link));
      // Filter out scraped links that already exist
      const newLinks = scrapedLinks.filter(l => !existingLinkSet.has(typeof l === 'string' ? l : l.link));
      // Merge: existing links first, then new scraped links
      r.stream_links = [...existingLinks, ...newLinks];
    } else {
      r.stream_links = null;
    }
  }

  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('matches').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error('Upsert error:', error.message);
      throw error;
    }
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
