// PMI Calculator parity audit — golden standard: src/domains/calculator/components/PmiCalculator.tsx
// Markers derived from the PMI implementation:
//  1. Layout:      Breadcrumb + racira-page-container + lg:grid-cols-[460px_1fr] two-column card layout
//  2. Inputs:      CompactInput-style inputs with $/% prefix/suffix affordances
//  3. Validation:  inline field validation + disabled Calculate / Reset button pattern
//  4. Results:     breakdown table, chart (recharts), amortization-style rows
//  5. SEO:         max-w-[1180px] wrapper -> AdPlaceholder -> section.prose-finance article -> FAQSection(pageUrl) -> PopularCalculators
const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

function stripJsx(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/\s+/g, ' ');
}
function wordCount(text) {
  return stripJsx(text).split(' ').filter(w => w.length > 1).length;
}

const rows = [];
for (const f of files) {
  const p = path.join(compDir, f);
  const text = fs.readFileSync(p, 'utf8');
  const lines = text.split('\n').length;
  const bytes = Buffer.byteLength(text);

  // --- structure markers ---
  const hasBreadcrumb = /from ["']@\/components\/Breadcrumb["']|<Breadcrumb\b/.test(text);
  const hasTwoCol = /lg:grid-cols-\[460px_1fr\]/.test(text);
  const hasCompactInput = /CompactInput/.test(text);
  const hasUnitToggle = /dpMode|unit[A-Z]|UnitToggle|showAdv|Advanced Options/i.test(text);
  const hasValidation = /valErrors|hasValidationErrors|validation/i.test(text);
  const hasCalcBtn = />\s*Calculate\s*</.test(text) || />Calculate</.test(text);
  const hasReset = /RotateCcw|aria-label="Reset"/.test(text);
  const hasPrint = /Printer|window\.print/.test(text);
  const hasChart = /recharts|ResponsiveContainer/.test(text);
  const hasAmort = /amortization|schedule/i.test(text);
  const hasLogicFile = /from ["']\.\/[a-zA-Z]+Logic["']/.test(text);

  // --- SEO section markers (unboxed: max-w wrapper, not inside a card) ---
  const hasMaxW = /max-w-\[1180px\]\s+mt-8|max-w-\[1180px\] mt-6|mt-8">\s*<AdPlaceholder/.test(text);
  const hasAd = /<AdPlaceholder/.test(text);
  const hasProse = /prose-finance/.test(text);
  const hasFaq = /<FAQSection/.test(text);
  const hasFaqUrl = /FAQSection\s+faqs=\{[\s\S]*?pageUrl=/.test(text);
  const hasPopular = /<PopularCalculators/.test(text);
  const faqCount = (text.match(/question:/g) || []).length;
  const h2Count = (text.match(/<h2\b/g) || []).length;

  // SEO word count: text from the prose-finance section to the FAQ block
  let seoWc = 0;
  const proseIdx = text.indexOf('prose-finance');
  if (proseIdx !== -1) {
    const secStart = text.lastIndexOf('<section', proseIdx);
    const faqIdx = text.indexOf('<FAQSection', proseIdx);
    const end = faqIdx !== -1 ? faqIdx : text.length;
    seoWc = wordCount(text.slice(secStart, end));
  }

  // stub/placeholder detection
  const isStub = /Value A|placeholder UI|coming soon|TODO|FIXME/i.test(text) && lines < 60;
  const isComingSoonView = /ComingSoon/.test(f) || lines < 25;

  rows.push({
    f,
    lines, bytes,
    layout: hasBreadcrumb && hasTwoCol ? 'pmi' : hasTwoCol ? 'two-col' : 'other',
    breadcrumb: hasBreadcrumb, compactInput: hasCompactInput, unitToggle: hasUnitToggle,
    validation: hasValidation, calcBtn: hasCalcBtn, reset: hasReset, print: hasPrint,
    chart: hasChart, amort: hasAmort, logicFile: hasLogicFile,
    seo: hasProse && hasFaq && hasPopular ? 'full' : hasProse || hasFaq ? 'partial' : 'missing',
    seoWc, h2Count, faqCount,
    ad: hasAd, popular: hasPopular, maxW: hasMaxW, faqUrl: hasFaqUrl,
    stub: isStub || isComingSoonView,
  });
}

// ── aggregates ─────────────────────────────────────────────────────
const n = rows.length;
const pct = (x) => `${x} (${(100 * x / n).toFixed(1)}%)`;
console.log(`TOTAL COMPONENTS: ${n}`);
console.log(`Layout: pmi-exact ${pct(rows.filter(r => r.layout === 'pmi').length)} | two-col ${pct(rows.filter(r => r.layout === 'two-col').length)} | other ${pct(rows.filter(r => r.layout === 'other').length)}`);
for (const k of ['breadcrumb', 'compactInput', 'unitToggle', 'validation', 'calcBtn', 'reset', 'print', 'chart', 'amort', 'ad', 'popular', 'faqUrl']) {
  console.log(`  ${k}: ${pct(rows.filter(r => r[k]).length)}`);
}
console.log(`SEO section: full ${pct(rows.filter(r => r.seo === 'full').length)} | partial ${pct(rows.filter(r => r.seo === 'partial').length)} | missing ${pct(rows.filter(r => r.seo === 'missing').length)}`);
const wcBuckets = { over1500: 0, w800_1499: 0, under800: 0, zero: 0 };
rows.forEach(r => {
  if (r.seoWc === 0) wcBuckets.zero++;
  else if (r.seoWc < 800) wcBuckets.under800++;
  else if (r.seoWc < 1500) wcBuckets.w800_1499++;
  else wcBuckets.over1500++;
});
console.log(`SEO words: >=1500 ${wcBuckets.over1500} | 800-1499 ${wcBuckets.w800_1499} | <800 ${wcBuckets.under800} | 0 ${wcBuckets.zero}`);
console.log(`Stub-like (<25 lines or placeholder text): ${rows.filter(r => r.stub).length}`);

// ── worst offenders for the table ──────────────────────────────────
const score = (r) => (r.seo === 'missing' ? 4 : r.seo === 'partial' ? 2 : 0)
  + (r.seoWc < 800 && r.seoWc > 0 ? 2 : 0)
  + (!r.faqUrl && r.faqCount > 0 ? 1 : 0)
  + (!r.ad || !r.popular ? 1 : 0)
  + (!r.calcBtn ? 1 : 0)
  + (!r.validation ? 0.5 : 0)
  + (!r.breadcrumb ? 0.5 : 0);
const ranked = rows.map(r => ({ ...r, gap: score(r) })).filter(r => !r.stub).sort((a, b) => b.gap - a.gap);

console.log('\n=== TOP 40 GAPS (excluding stubs) ===');
ranked.slice(0, 40).forEach(r => {
  console.log(`${r.f} | lines=${r.lines} | seo=${r.seo}(${r.seoWc}w,${r.faqCount}faq,${r.h2Count}h2) | calcBtn=${r.calcBtn} | valid=${r.validation} | bc=${r.breadcrumb} | ad=${r.ad} pop=${r.popular} faqUrl=${r.faqUrl}`);
});

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'pmi_parity_result.json'), JSON.stringify(rows, null, 2));
console.log('\nWrote scripts/pmi_parity_result.json');
