// Final PMI parity classification — only components wired as tool pages count.
const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');

// 1. Which component files are wired as tool pages in lazyComponents?
const lazy = fs.readFileSync('src/app/calculator/lazyComponents.tsx', 'utf8');
const wiredByFile = new Map(); // file base name -> Set of slugs
for (const m of lazy.matchAll(/"([^"]+)":\s*\(\)\s*=>\s*import\("([^"]+)"\)/g)) {
  const slug = m[1];
  const base = path.basename(m[2]) + '.tsx';
  if (!wiredByFile.has(base)) wiredByFile.set(base, new Set());
  wiredByFile.get(base).add(slug);
}
// Also the old app/calculator/page.tsx may map some; keep to lazyComponents (ToolView uses it).

// 2. Scan components
function stripJsx(text) {
  return text.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\{[^{}]*\}/g, ' ').replace(/\s+/g, ' ');
}
const wc = (t) => stripJsx(t).split(' ').filter(w => w.length > 1).length;

const rows = [];
for (const f of fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'))) {
  const slugs = wiredByFile.get(f);
  const isTool = !!slugs;
  const text = fs.readFileSync(path.join(compDir, f), 'utf8');
  const lines = text.split('\n').length;

  const hasBreadcrumb = /<Breadcrumb\b/.test(text);
  const hasTwoCol = /lg:grid-cols-\[460px_1fr\]/.test(text);
  const hasCompactInput = /CompactInput/.test(text);
  const hasPrefixSuffix = /prefix=|suffix=/.test(text);
  const hasAdv = /Advanced Options|showAdv/.test(text);
  const hasValidation = /valErrors|hasValidationErrors/.test(text);
  const hasCalcBtn = />Calculate</.test(text);
  const hasReset = /RotateCcw|aria-label="Reset"/.test(text);
  const hasChart = /recharts|ResponsiveContainer/.test(text);
  const hasPrint = /Printer|window\.print/.test(text);
  const hasAd = /<AdPlaceholder/.test(text);
  const hasProse = /prose-finance/.test(text);
  const legacySeo = /mt-12 space-y-8|className="[^"]*space-y-8[^"]*"/.test(text) && (text.match(/<h2\b/g) || []).length >= 3;
  const hasFaq = /<FAQSection/.test(text);
  const hasFaqUrl = /<FAQSection\s+faqs=\{[\s\S]*?pageUrl=/.test(text);
  const hasPopular = /<PopularCalculators/.test(text);
  const faqCount = (text.match(/question:/g) || []).length;
  const h2Count = (text.match(/<h2\b/g) || []).length;
  const bareCalc = /className="calculator-container|result-grid|chart-placeholder/.test(text);

  let seoWc = 0;
  const proseIdx = text.indexOf('prose-finance');
  if (proseIdx !== -1) {
    const secStart = text.lastIndexOf('<section', proseIdx);
    const faqIdx = text.indexOf('<FAQSection', proseIdx);
    seoWc = wc(text.slice(secStart, faqIdx !== -1 ? faqIdx : text.length));
  } else if (legacySeo) {
    seoWc = wc(text.slice(text.lastIndexOf('<h2'))) / 2 | 0;
  }

  // Status classification vs PMI standard
  let status;
  if (!isTool) status = 'HELPER';                     // sub-component, not a page
  else if (bareCalc || lines < 80) status = 'STUB';   // template UI
  else {
    const seoOk = hasProse && hasFaq && hasPopular && seoWc >= 800 && hasFaqUrl;
    const coreOk = hasBreadcrumb && hasCalcBtn && hasReset && hasAd;
    if (seoOk && coreOk && hasTwoCol) status = 'Complete';
    else if (!hasProse && !hasFaq && !legacySeo) status = 'Partial';  // no SEO article at all
    else status = 'Partial';                          // any shortfall
    if (seoOk && coreOk && !hasTwoCol) status = 'Complete*'; // complete but layout variant
  }

  const gaps = [];
  if (isTool) {
    if (!hasBreadcrumb) gaps.push('no Breadcrumb');
    if (!hasTwoCol && status !== 'STUB') gaps.push('layout not pmi 2-col');
    if (!hasCalcBtn) gaps.push('no Calculate btn');
    if (!hasReset) gaps.push('no Reset');
    if (!hasValidation) gaps.push('no inline validation');
    if (!hasAd) gaps.push('no AdPlaceholder');
    if (!hasProse) gaps.push('no prose-finance SEO');
    else if (seoWc < 800) gaps.push(`thin SEO (${seoWc}w)`);
    if (!legacySeo && !hasProse && h2Count >= 3) gaps.push('legacy/unboxed-missing SEO');
    if (!hasFaq) gaps.push('no FAQ');
    else if (!hasFaqUrl) gaps.push('FAQ missing pageUrl');
    if (!hasPopular) gaps.push('no PopularCalculators');
  }

  rows.push({
    file: f, slugs: slugs ? [...slugs].join(' / ') : '', status, lines,
    seoWc, faqCount, h2Count,
    twoCol: hasTwoCol, breadcrumb: hasBreadcrumb, compact: hasCompactInput,
    prefixSuffix: hasPrefixSuffix, adv: hasAdv, validation: hasValidation,
    chart: hasChart, print: hasPrint, amort: /amortization/i.test(text),
    gaps: gaps.join('; '),
  });
}

const tools = rows.filter(r => r.status !== 'HELPER');
const n = tools.length;
const count = (s) => tools.filter(t => t.status === s).length;
console.log(`TOOL PAGES: ${n} | Complete: ${count('Complete')} | Complete* (layout variant): ${count('Complete*')} | Partial: ${count('Partial')} | Stub: ${count('STUB')}`);
console.log(`Helpers (non-page components): ${rows.length - n}`);

// gap frequency
const gapFreq = {};
tools.forEach(t => t.gaps && t.gaps.split('; ').forEach(g => { if (g) gapFreq[g] = (gapFreq[g] || 0) + 1; }));
console.log('\nGAP FREQUENCY:');
Object.entries(gapFreq).sort((a, b) => b[1] - a[1]).forEach(([g, c]) => console.log(`  ${g}: ${c} (${(100 * c / n).toFixed(1)}%)`));

// worst list
const sev = (t) => {
  let s = 0;
  if (!t.gaps) return 0;
  for (const g of t.gaps.split('; ')) {
    if (g.includes('no prose-finance')) s += 5;
    else if (g.includes('no FAQ')) s += 3;
    else if (g.includes('thin SEO')) s += 3;
    else if (g.includes('no PopularCalculators') || g.includes('no AdPlaceholder')) s += 2;
    else if (g.includes('FAQ missing pageUrl')) s += 1;
    else if (g.includes('validation')) s += 1;
    else s += 0.5;
  }
  return s;
};
const worst = tools.map(t => ({ ...t, sev: sev(t) })).sort((a, b) => b.sev - a.sev);
console.log('\nTOP 30 WORST TOOL PAGES:');
worst.filter(t => t.sev > 0).slice(0, 30).forEach(t =>
  console.log(`  ${t.file} [${t.status}] sev=${t.sev} — ${t.gaps}`));

// write full CSV
const csv = ['tool_slug,component,status,seo_words,faq_count,layout_two_col,breadcrumb,inline_validation,gaps'];
tools.sort((a, b) => a.file.localeCompare(b.file)).forEach(t =>
  csv.push([t.slugs, t.file, t.status, t.seoWc, t.faqCount, t.twoCol, t.breadcrumb, t.validation, `"${t.gaps}"`].join(',')));
fs.writeFileSync('scripts/pmi_parity_tools.csv', csv.join('\n'));
console.log(`\nWrote scripts/pmi_parity_tools.csv (${tools.length} tool pages)`);
