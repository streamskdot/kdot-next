#!/usr/bin/env node
/**
 * Unified scraper that runs football, cricket and ppv.to scrapers
 */

import { spawn } from 'node:child_process';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

function timestamp() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${C.cyan}[${hh}:${mm}:${ss}]${C.reset}`;
}

function log(message) {
  console.log(`${timestamp()} ${message}`);
}

async function runScraper(name, script) {
  log(`${C.bold}Running ${name} scraper...${C.reset}`);
  
  return new Promise((resolve, reject) => {
    const process = spawn('node', [script], {
      stdio: 'inherit',
      shell: true,
    });

    process.on('close', (code) => {
      if (code === 0) {
        log(`${C.green}✓ ${name} scraper completed successfully${C.reset}`);
        resolve(code);
      } else {
        log(`${C.red}✗ ${name} scraper failed with code ${code}${C.reset}`);
        reject(new Error(`${name} scraper failed`));
      }
    });

    process.on('error', (err) => {
      log(`${C.red}✗ ${name} scraper error: ${err.message}${C.reset}`);
      reject(err);
    });
  });
}

(async () => {
  console.log(`\n${C.bold}${C.cyan}═══════════════════════════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}${C.cyan}           KDOT STREAMS - UNIFIED SCRAPER${C.reset}`);
  console.log(`${C.bold}${C.cyan}═══════════════════════════════════════════════════════════════${C.reset}\n`);

  const startTime = Date.now();

  try {
    // Run football scraper
    await runScraper('Football', 'scripts/scraper-football.mjs');
    
    // Run cricket scraper
    await runScraper('Cricket', 'scripts/scraper-cricket.mjs');

    // Run ppv.to football scraper
    await runScraper('PPV Football', 'scripts/ppv/scraper-football.mjs');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${C.green}${C.bold}✓ All scrapers completed successfully in ${duration}s${C.reset}\n`);
    process.exit(0);
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${C.red}${C.bold}✗ Scraper failed after ${duration}s${C.reset}`);
    console.log(`${C.red}${error.message}${C.reset}\n`);
    process.exit(1);
  }
})();
