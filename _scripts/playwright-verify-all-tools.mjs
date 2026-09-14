#!/usr/bin/env node
/**
 * Playwright verification pass for all Racira Developer Tools pages.
 * Loads every live tool page in a real browser and checks for errors.
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3003';
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

// Extract all live tool slugs from the registry
const registrySrc = readFileSync('src/domains/developers/registry.ts', 'utf-8');
const builtMatch = registrySrc.match(/const built = new Set\(\[([^\]]+)\]\)/);
const liveSlugs = builtMatch
  ? builtMatch[1].split(',').map(s => s.trim().replace(/"/g, ''))
  : [];

// Extract tool names from the registry
const nameRegex = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g;
const nameMap = {};
let m;
while ((m = nameRegex.exec(registrySrc)) !== null) {
  nameMap[m[1]] = m[2];
}

const liveTools = liveSlugs.map(slug => ({
  slug,
  name: nameMap[slug] || slug,
  url: `${BASE}/developers/${slug}`,
}));

console.log(`\n🔍 Verifying ${liveTools.length} live developer tool pages...\n`);

async function verifyPage(context, { slug, name, url }) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('React DevTools') && !text.includes('favicon')) {
        consoleErrors.push(text.slice(0, 300));
      }
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message?.slice(0, 300) || 'Unknown error');
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT_MS,
    });
    const status = response?.status() ?? 0;

    // Wait for hydration
    await page.waitForTimeout(1500);

    // Check for Next.js error overlay in shadow DOM
    const hasErrorOverlay = await page.evaluate(() => {
      const el = document.querySelector('nextjs-portal');
      if (!el?.shadowRoot) return false;
      const text = el.shadowRoot.textContent || '';
      return text.includes('Unhandled Runtime Error') || text.includes('Hydration failed');
    });

    // Check page for error text
    const hasErrorText = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Unhandled Runtime Error') || text.includes('Application error');
    });

    const passed = status === 200 && !hasErrorOverlay && !hasErrorText && pageErrors.length === 0;

    return { slug, name, status, passed, consoleErrors: consoleErrors.slice(0, 2), pageErrors: pageErrors.slice(0, 2) };
  } catch (err) {
    return { slug, name, status: 0, passed: false, consoleErrors: [], pageErrors: [err.message?.slice(0, 200)] };
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  for (let i = 0; i < liveTools.length; i += CONCURRENCY) {
    const batch = liveTools.slice(i, i + CONCURRENCY);
    const batchNum = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(liveTools.length / CONCURRENCY);
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`);
    const batchResults = await Promise.all(batch.map(t => verifyPage(context, t)));
    results.push(...batchResults);
    const passed = batchResults.filter(r => r.passed).length;
    console.log(` ${passed}/${batch.length} OK`);
  }

  await browser.close();

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log(`\n📊 Results: ${passed.length}/${results.length} passed`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed pages:`);
    for (const f of failed) {
      console.log(`  ${f.slug}: status=${f.status} errors=${f.pageErrors.length}`);
      for (const e of f.pageErrors) console.log(`    ${e}`);
      for (const e of f.consoleErrors) console.log(`    [console] ${e}`);
    }
  }

  console.log(`\n${failed.length === 0 ? '✅ ALL PAGES PASSED' : `❌ ${failed.length} PAGES FAILED`}`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
