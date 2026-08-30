/**
 * Post-dedup verification: confirm each of the 7 previously-affected
 * consumers now shows exactly 1 entry per formerly-duplicated slug.
 */
import { tools, SEARCH_REGISTRY } from '../src/domains/pdf/registry/tools';

const DUP_SLUGS = ['page-dimensions', 'pdf-to-text', 'view-metadata', 'certificate-inspector', 'flatten'];

let passed = 0;
let failed = 0;

function check(label: string, count: number) {
  if (count === 1) {
    console.log(`  PASS  ${label}: 1 entry`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}: ${count} entries (expected 1)`);
    failed++;
  }
}

// ── Consumer 1: sitemap.ts — tools.filter(t => t.category === "pdf" && t.status === "live") ──
console.log('\n1. sitemap.ts (array filter, status=live):');
const sitemapFiltered = tools.filter(t => t.category === 'pdf' && t.status === 'live');
for (const slug of DUP_SLUGS) {
  const count = sitemapFiltered.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}

// ── Consumer 2: sitemapSources.ts — PDF_TOOLS.filter(isLiveTool && subCategory match) ──
console.log('\n2. sitemapSources.ts (array filter, isLiveTool):');
const sitemapSrcFiltered = tools.filter(t => t.status === 'live' && t.subCategory);
for (const slug of DUP_SLUGS) {
  const count = sitemapSrcFiltered.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}

// ── Consumer 3: ClientGrid.tsx — tools.filter(t => t.subCategory === subCategory) ──
console.log('\n3. ClientGrid.tsx (grid card count by subCategory):');
// Group by subCategory and check each slug appears once in its group
for (const slug of DUP_SLUGS) {
  const tool = tools.find(t => t.slug === slug);
  if (!tool || !tool.subCategory) {
    console.log(`  SKIP  ${slug} — not found or no subCategory`);
    continue;
  }
  const group = tools.filter(t => t.subCategory === tool.subCategory);
  const count = group.filter(t => t.slug === slug).length;
  check(`  ${slug} (in "${tool.subCategory}")`, count);
}

// ── Consumer 4: Index.tsx — onlyLive(PDF_TOOLS).length ──
console.log('\n4. Index.tsx (hero tool count):');
const liveTools = tools.filter(t => t.status === 'live');
for (const slug of DUP_SLUGS) {
  const count = liveTools.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}
console.log(`  INFO  Total live tool count: ${liveTools.length}`);

// ── Consumer 5: SearchPdf.tsx — tools.map(t => ({ ...t, href: ... })) ──
console.log('\n5. SearchPdf.tsx (search registry):');
for (const slug of DUP_SLUGS) {
  const count = tools.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}

// ── Consumer 6: SEARCH_REGISTRY export — tools.map(tool => ({ ... })) ──
console.log('\n6. SEARCH_REGISTRY export:');
for (const slug of DUP_SLUGS) {
  const count = SEARCH_REGISTRY.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}
console.log(`  INFO  Total SEARCH_REGISTRY entries: ${SEARCH_REGISTRY.length}`);

// ── Consumer 7: RelatedTools.tsx — uses tools array ──
console.log('\n7. RelatedTools.tsx (tools array iteration):');
for (const slug of DUP_SLUGS) {
  const count = tools.filter(t => t.slug === slug).length;
  check(`  ${slug}`, count);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
