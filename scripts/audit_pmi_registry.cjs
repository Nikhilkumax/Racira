// Parse calculator registry files + cross-ref lazyComponents wiring + component files.
const fs = require('fs');
const path = require('path');

const regDir = 'src/domains/calculator/registry';
const files = fs.readdirSync(regDir).filter(f => f.endsWith('.ts'));
const all = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(regDir, f), 'utf8');
  // registry entries are single-line object literals ending with }, — split on those
  const entries = text.match(/\{[^{}]*?\}/g) || [];
  for (const entry of entries) {
    const get = (k) => {
      const r = new RegExp(k + ':\\s*"([^"]*)"').exec(entry);
      return r ? r[1] : null;
    };
    if (!get('slug')) continue;
    all.push({ slug: get('slug'), name: get('name'), category: get('category'), subcategory: get('subcategory'), status: get('status'), regFile: f });
  }
}

console.log('registry entries parsed:', all.length);
const byCat = {};
all.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + 1; });
console.log('by category:', JSON.stringify(byCat));
const live = all.filter(c => c.status === 'live');
console.log('live:', live.length, '| soon:', all.length - live.length);

const fin = all.filter(c => c.category === 'FINANCE');
const finSubs = {};
fin.forEach(c => {
  const s = c.subcategory || 'General';
  finSubs[s] = finSubs[s] || { total: 0, live: 0 };
  finSubs[s].total++;
  if (c.status === 'live') finSubs[s].live++;
});
console.log('FINANCE:', fin.length, 'total,', fin.filter(c => c.status === 'live').length, 'live');
Object.entries(finSubs).sort((a, b) => b[1].total - a[1].total).forEach(([k, v]) =>
  console.log('  ', k, ':', v.total, 'total,', v.live, 'live'));

// duplicate slugs
const seen = new Map(); const dups = [];
all.forEach(c => {
  if (seen.has(c.slug)) dups.push(c.slug + ' [' + seen.get(c.slug) + ' vs ' + c.name + ']');
  else seen.set(c.slug, c.name);
});
console.log('duplicate slugs:', dups.length, dups.slice(0, 12).join(' | '));

// cross-ref lazyComponents wiring
const lazy = fs.readFileSync('src/app/calculator/lazyComponents.tsx', 'utf8');
const wired = new Set([...lazy.matchAll(/"([^"]+)":\s*\(\)\s*=>/g)].map(m => m[1]));
console.log('lazyComponents wired entries:', wired.size);
const liveUnwired = live.filter(c => !wired.has(c.slug));
console.log('LIVE entries with NO wired component:', liveUnwired.length);
liveUnwired.forEach(c => console.log('   ', c.slug, '|', c.subcategory, '|', c.regFile));

// live entries whose component file may be missing (slug -> PascalCase guess)
const compDir = 'src/domains/calculator/components';
const compFiles = new Set(fs.readdirSync(compDir));
const kebab2pascal = (s) => s.split('-').map(w => {
  if (/^\d/.test(w)) return w.toUpperCase();
  return w.charAt(0).toUpperCase() + w.slice(1);
}).join('');
const liveNoFile = live.filter(c => {
  const guess = kebab2pascal(c.slug) + '.tsx';
  return !compFiles.has(guess) && !compFiles.has(kebab2pascal(c.slug.replace(/-calculator$/, '')) + 'Calculator.tsx') && !compFiles.has(kebab2pascal(c.slug.replace(/-calculator$/, '')) + '.tsx');
});
console.log('LIVE entries with NO obvious component file (name-guess):', liveNoFile.length);
liveNoFile.slice(0, 40).forEach(c => console.log('   ', c.slug, '->', kebab2pascal(c.slug) + '.tsx'));

// unwired slugs in registry overall (soons excluded from pages but check counts)
fs.writeFileSync('scripts/pmi_registry.json', JSON.stringify(all, null, 2));
console.log('\nWrote scripts/pmi_registry.json');
