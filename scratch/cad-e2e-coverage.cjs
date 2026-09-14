const { readFileSync, readdirSync } = require('fs');
const reg = readFileSync('src/domains/cad/registry.ts','utf-8');
const activeBody = (reg.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/)[1]).replace(/\/\/[^\r\n]*/g,'');
const active = new Set(activeBody.split(',').map(s=>s.trim().replace(/["']/g,'')).filter(Boolean));
const mentioned = new Set();
for (const f of readdirSync('e2e').filter(f=>f.startsWith('cad-'))) {
  const src = readFileSync('e2e/'+f,'utf-8');
  for (const m of src.matchAll(/cad\/([a-z0-9-]+)/g)) mentioned.add(m[1]);
}
const uncovered = [...active].filter(s => !mentioned.has(s));
console.log('live slugs:', active.size, '| mentioned in e2e:', [...active].filter(s=>mentioned.has(s)).length);
console.log('live tools NOT exercised in any e2e test:', uncovered.length ? uncovered : 'NONE');
