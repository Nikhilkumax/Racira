const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

const lockedH2 = 'text-2xl font-bold mb-3';
let btnNotCalculate = [];
let bannerAboveGrid = 0;
let seoWordCounts = [];
let total = files.length;

const alertRe = /(Alert|alert-|bg-destructive|border-destructive|text-destructive|role="alert")/;

for (const f of files) {
  const text = fs.readFileSync(path.join(compDir, f), 'utf8');

  // Button label check
  const btnRe = /<button[^>]*>([\s\S]*?)<\/button>/g;
  let bm, fileHasNonCalc = false, labels = new Set();
  while ((bm = btnRe.exec(text)) !== null) {
    const inner = bm[1].replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').trim();
    if (/calculate|compute|submit|get results|estimate|calcular/i.test(inner)) {
      labels.add(inner);
      if (inner.toLowerCase() !== 'calculate') fileHasNonCalc = true;
    }
  }
  if (fileHasNonCalc) btnNotCalculate.push({ f, labels: [...labels] });

  // SEO word count: find the prose-finance section block (may have other attrs), then count words until EOF section ends.
  const startIdx = text.indexOf('prose-finance');
  let wc = 0;
  if (startIdx !== -1) {
    // from the containing <section ...> start
    const secStart = text.lastIndexOf('<section', startIdx);
    const secBlock = text.slice(secStart);
    const stripped = secBlock
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    wc = stripped.split(' ').filter(Boolean).length;
  }
  seoWordCounts.push({ f, wc });

  // banner above grid: detect Alert-like components between breadcrumb and the grid
  // crude: count Alert usage in first 40% of file
  const head = text.slice(0, Math.floor(text.length * 0.4));
  if (alertRe.test(head)) bannerAboveGrid++;
}

console.log('TOTAL FILES:', total);
console.log('--- Button label NOT exactly "Calculate":', btnNotCalculate.length);
// group by label variant
const variantCount = {};
btnNotCalculate.forEach(({labels}) => labels.forEach(l => { variantCount[l] = (variantCount[l]||0)+1; }));
console.log('Label variants:', JSON.stringify(variantCount, null, 0));

const sorted = seoWordCounts.slice().sort((a,b)=>a.wc-b.wc);
const under1500 = seoWordCounts.filter(x=>x.wc<1500).length;
const under800 = seoWordCounts.filter(x=>x.wc<800).length;
const between = seoWordCounts.filter(x=>x.wc>=800 && x.wc<1500).length;
const over = seoWordCounts.filter(x=>x.wc>=1500).length;
const zero = seoWordCounts.filter(x=>x.wc===0).length;
console.log('---');
console.log('SEO words: >=1500:', over, '| 800-1499:', between, '| <800:', under800, '| 0:', zero, '| total<1500:', under1500);
console.log('Lowest 25 SEO word counts:');
sorted.slice(0,25).forEach(x => console.log('  ', x.wc, x.f));
console.log('---');
console.log('Files w/ Alert-like markup in head (possible banner):', bannerAboveGrid);

// write json for later
fs.writeFileSync(path.join(process.cwd(),'scripts','audit_result.json'), JSON.stringify({btnNotCalculate, seoWordCounts}, null, 2));
console.log('Wrote scripts/audit_result.json');
