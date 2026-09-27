// Verify Batch 1+2: duplicate-content canonicalization + dead wired slugs.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Reuse the tsx-free loader trick: parse canonicalSlugs.ts with a regex
const mapText = fs.readFileSync('src/domains/calculator/canonicalSlugs.ts', 'utf8');
const CANON = {};
for (const m of mapText.matchAll(/"([^"]+)":\s*"([^"]+)",/g)) CANON[m[1]] = m[2];
const resolve = (s) => { let c = s, i = 0; while (CANON[c] && i++ < 5) c = CANON[c]; return c; };

// Re-parse registry (same logic as audit_pmi_registry.cjs)
const regDir = 'src/domains/calculator/registry';
const all = [];
for (const f of fs.readdirSync(regDir).filter(f => f.endsWith('.ts'))) {
  const text = fs.readFileSync(path.join(regDir, f), 'utf8');
  for (const entry of text.match(/\{[^{}]*?\}/g) || []) {
    const get = (k) => { const r = new RegExp(k + ':\\s*"([^"]*)"').exec(entry); return r ? r[1] : null; };
    if (get('slug')) all.push({ slug: get('slug'), name: get('name'), status: get('status'), file: f });
  }
}
const bySlug = new Map(all.map(c => [c.slug, c]));
console.log('registry entries:', all.length, '| live:', all.filter(c => c.status === 'live').length);

// lazyComponents wiring
const lazy = fs.readFileSync('src/app/calculator/lazyComponents.tsx', 'utf8');
const wired = new Map();
for (const m of lazy.matchAll(/"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g)) wired.set(m[1], m[2].split('/').pop());

// 1. live slugs sharing a component = duplicate-content groups (should be ZERO after alias filter)
const live = all.filter(c => c.status === 'live');
const comp2live = new Map();
for (const c of live) { const comp = wired.get(c.slug); if (comp) { if (!comp2live.has(comp)) comp2live.set(comp, []); comp2live.get(comp).push(c.slug); } }
const dups = [...comp2live.entries()].filter(([, v]) => v.length > 1);
console.log('\n[1] Live slugs sharing one component (dup-content groups):', dups.length);
dups.forEach(([comp, slugs]) => {
  const bad = slugs.filter(s => !CANON[s]);
  console.log('   ', comp + ':', slugs.join(', '), bad.length ? '  <-- NOT ALIAS-MAPPED: ' + bad.join(',') : '(all alias-mapped OK)');
});

// 2. alias map validity: every map key either exists in registry, or its canonical target exists
const aliasKeys = Object.keys(CANON);
const liveAliasKeys = aliasKeys.filter(k => bySlug.has(k) && bySlug.get(k).status === 'live');
const deadAliasKeys = aliasKeys.filter(k => !bySlug.has(k));
console.log('\n[2] alias map:', aliasKeys.length, 'entries |', liveAliasKeys.length, 'live registry aliases |', deadAliasKeys.length, 'dead-slug aliases');
const badTargets = deadAliasKeys.filter(k => { const t = resolve(k); return !bySlug.has(t) || bySlug.get(t).status !== 'live'; });
console.log('   dead aliases without a LIVE canonical target:', badTargets.length, badTargets.join(', '));
const chains = aliasKeys.filter(k => CANON[CANON[k]]);
console.log('   chained aliases (alias->alias):', chains.length, chains.join(', '));
const liveUnmappedDups = dups.flatMap(([, slugs]) => slugs.filter(s => !CANON[s]));
console.log('   live dup slugs missing from map:', liveUnmappedDups.length);

// 3. dead wired slugs remaining (wired slugs with no registry entry)
const deadWired = [...wired.keys()].filter(s => !bySlug.has(s));
console.log('\n[3] WIRED slugs with no registry entry (should be 0):', deadWired.length, deadWired.join(', '));

// 4. registry live slugs without wiring (should be 0)
const unwired = live.filter(c => !wired.has(c.slug));
console.log('[4] LIVE registry slugs not wired (should be 0):', unwired.length, unwired.slice(0, 10).map(c => c.slug).join(', '));

// 5. sitemap simulation: live + not stub + not alias
const stubs = new Set(['tidal-prediction-calculator', 'transformer-calculator']);
const sitemapUrls = live.filter(c => !stubs.has(c.slug) && !CANON[c.slug]);
console.log('\n[5] sitemap calculator URLs after fix:', sitemapUrls.length, '(before:', live.length - 2, ')');

// 6. SEARCH_REGISTRY simulation: unique canonical hrefs
const hrefs = new Set(all.map(c => '/calculator/' + resolve(c.slug)));
console.log('[6] SEARCH_REGISTRY unique canonical hrefs:', hrefs.size, 'of', all.length, 'entries');
