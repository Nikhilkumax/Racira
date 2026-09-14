const { readFileSync } = require('fs');
const reg = readFileSync('src/domains/cad/registry.ts','utf-8');
const tierSrc = readFileSync('_scripts/cad-tier-list.mjs','utf-8');
const toSlug = t => t.toLowerCase().replace(/&/g,'and').replace(/\//g,'-').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
// parse tiers
const tiers = {};
for (const m of tierSrc.matchAll(/"([a-z0-9-]+)":\s*"(E|M|H)"/g)) tiers[m[1]] = m[2];
// parse registry categories
const cats = []; let cur = null;
for (const line of reg.split(/\r?\n/)) {
  const cm = line.match(/cat\("([^"]+)",\s*\[/); if (cm) { cur = { title: cm[1], tools: [] }; cats.push(cur); continue; }
  const tm = line.match(/\[\s*"([^"]+)",\s*"[^"]*"\s*\]/); if (tm && cur) cur.tools.push(tm[1]);
}
const activeBody = (reg.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/)[1]).replace(/\/\/[^\r\n]*/g,'');
const active = new Set(activeBody.split(',').map(s=>s.trim().replace(/["']/g,'')).filter(Boolean));
const x = {}; // tier -> {live, soon}
for (const c of cats) for (const name of c.tools) {
  const s = toSlug(name); const t = tiers[s];
  if (!t) { console.log('NO TIER:', s); continue; }
  x[t] = x[t] || { E: {live:0,soon:0}, M: {live:0,soon:0}, H: {live:0,soon:0} };
  x[t][t][active.has(s) ? 'live' : 'soon']++;
}
const label = { E:'easy', M:'medium', H:'hard' };
for (const t of ['E','M','H']) console.log(label[t], JSON.stringify(x[t][t]));
