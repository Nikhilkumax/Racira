const { readFileSync, readdirSync, existsSync } = require('fs');
const reg = readFileSync('src/domains/cad/registry.ts','utf-8');
const active = new Set((reg.match(/const ACTIVE_SLUGS = new Set\(\[([\s\S]*?)\]\)/)[1]).replace(/\/\/[^\r\n]*/g,'').split(',').map(s=>s.trim().replace(/["']/g,'')).filter(Boolean));
const easyReg = readFileSync('src/domains/cad/components/tools/easy/registry.tsx','utf-8');
const medReg = readFileSync('src/domains/cad/components/tools/medium/registry.tsx','utf-8');
const wired = new Set([...easyReg.matchAll(/"([a-z0-9-]+)":\s*dynamic/g)].map(m=>m[1]));
[...medReg.matchAll(/"([a-z0-9-]+)":\s*dynamic/g)].forEach(m=>wired.add(m[1]));
wired.add('2d-cad-sketch-tool');
console.log('wired entries:', wired.size, '| ACTIVE_SLUGS:', active.size);
const missing = [];
for (const s of active) {
  if (s === '2d-cad-sketch-tool') { if (!existsSync('src/domains/cad/components/tools/sketch-tool.tsx')) missing.push(s); continue; }
  if (!existsSync('src/domains/cad/components/tools/easy/'+s+'.tsx') && !existsSync('src/domains/cad/components/tools/medium/'+s+'.tsx')) missing.push(s);
}
console.log('live slugs with NO component file:', missing.length ? missing : 'NONE');
const files = [];
for (const dir of ['easy','medium']) {
  for (const f of readdirSync('src/domains/cad/components/tools/'+dir)) {
    if (f.endsWith('.tsx') && f !== 'registry.tsx' && f !== 'ui.tsx' && f !== 'gdnt-shared.tsx' && f !== 'gdnt-diagrams.tsx') files.push(dir+'/'+f);
  }
}
const orphans = files.filter(f => !wired.has(f.split('/').pop().replace('.tsx','')));
console.log('component files not wired in any registry:', orphans.length ? orphans : 'NONE');
console.log('total tool component files:', files.length);
