const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

const offenders = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(compDir, f), 'utf8');
  const btnRe = /<button[^>]*>([\s\S]*?)<\/button>/g;
  let bm;
  while ((bm = btnRe.exec(text)) !== null) {
    const raw = bm[1];
    // clean: remove JSX tags and {expressions}
    let inner = raw.replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').trim();
    if (!inner) continue;
    // does this button look like the action button?
    if (/calculate|compute|submit|get results|estimate|calcular/i.test(inner) && inner.length < 60) {
      if (inner.toLowerCase() !== 'calculate') {
        offenders.push({ f, label: inner });
      }
    }
  }
}
const byLabel = {};
offenders.forEach(o => { byLabel[o.label] = (byLabel[o.label]||[]); byLabel[o.label].push(o.f); });
console.log('TOTAL files with non-exact "Calculate" action button:', offenders.length);
Object.keys(byLabel).sort().forEach(l => console.log(`\n[${l}] (${byLabel[l].length}):\n  ` + byLabel[l].join('\n  ')));
fs.writeFileSync(path.join(process.cwd(),'scripts','btn_offenders.json'), JSON.stringify(byLabel, null, 2));
