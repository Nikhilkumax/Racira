const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

const lockedH2 = 'text-2xl font-bold mb-3';
let btnNotCalculate = [];
let h2Deviation = new Map();
let subtitleUnderH1 = 0;
let seoWordCounts = [];
let noChart = [];
let smallFiles = [];
let total = files.length;
let h2Exact = 0;

// count SEO h2 occurrences with non-locked class
function findAll(reStr, text) {
  const re = new RegExp(reStr, 'g');
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m);
  return out;
}

for (const f of files) {
  const full = path.join(compDir, f);
  const text = fs.readFileSync(full, 'utf8');
  const sizeKB = fs.statSync(full).size / 1024;

  // Button label check: look for >Calculate ...< inside a button with onClick={handleCalculate} or just generic
  // We look for the word Calculate inside <button ...>...</button> blocks and capture inner text
  const btnRe = /<button[^>]*>([\s\S]*?)<\/button>/g;
  let bm;
  let fileHasNonCalc = false;
  while ((bm = btnRe.exec(text)) !== null) {
    const inner = bm[1].replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').trim();
    // only consider buttons that look like calculate actions (contain Calculate or Compute or Submit or Get Results)
    if (/calculate|compute|submit|get results|estimate/i.test(inner)) {
      if (inner.toLowerCase() !== 'calculate') {
        fileHasNonCalc = true;
      }
    }
  }
  if (fileHasNonCalc) btnNotCalculate.push(f);

  // SEO h2 classNames
  const h2Re = /<h2\s+className="([^"]*)"/g;
  let h2m;
  let fileH2Exact = true;
  let fileH2Seen = false;
  while ((h2m = h2Re.exec(text)) !== null) {
    fileH2Seen = true;
    if (h2m[1] !== lockedH2) {
      fileH2Exact = false;
      h2Deviation.set(f, (h2Deviation.get(f) || new Set()).add(h2m[1]));
    }
  }
  if (fileH2Seen && fileH2Exact) h2Exact++;

  // subtitle under h1: <h1 ...>...</h1>\s*<p className="text-sm text-muted-foreground
  if (/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*className="text-sm text-muted-foreground/.test(text)) {
    subtitleUnderH1++;
  }

  // chart import check
  if (!/recharts/i.test(text)) {
    noChart.push(f);
  }

  // SEO word count: gather text inside the prose-finance / section mt-12 blocks
  const seoBlock = text.match(/prose-finance[\s\S]*$/);
  let wc = 0;
  if (seoBlock) {
    const stripped = seoBlock[0].replace(/<[^>]+>/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
    wc = stripped.split(' ').filter(Boolean).length;
  }
  seoWordCounts.push({ f, wc });

  if (sizeKB < 8) smallFiles.push(f);
}

console.log('TOTAL FILES:', total);
console.log('---');
console.log('Button label NOT exactly "Calculate":', btnNotCalculate.length);
console.log('  ' + btnNotCalculate.slice(0,20).join(', '));
console.log('---');
console.log('Files with SEO <h2> class NOT exactly locked (', lockedH2, '):', h2Deviation.size);
let devSet = new Set();
h2Deviation.forEach((set, f) => set.forEach(v => devSet.add(v)));
console.log('  distinct bad H2 classes:', [...devSet].slice(0,30).join(' | '));
console.log('  files w/ exact H2:', h2Exact);
console.log('---');
console.log('Subtitle <p> under H1:', subtitleUnderH1);
console.log('---');
console.log('Files WITHOUT recharts import:', noChart.length);
console.log('  ' + noChart.slice(0,30).join(', '));
console.log('---');
console.log('Files < 8KB:', smallFiles.length);
console.log('---');
const sorted = seoWordCounts.slice().sort((a,b)=>a.wc-b.wc);
console.log('SEO word count distribution (lowest 30):');
sorted.slice(0,30).forEach(x => console.log('  ', x.wc, x.f));
const under1500 = seoWordCounts.filter(x=>x.wc<1500).length;
const under800 = seoWordCounts.filter(x=>x.wc<800).length;
const zero = seoWordCounts.filter(x=>x.wc===0).length;
console.log('SEO < 1500 words:', under1500, '| < 800 words:', under800, '| 0 words (no seo block found):', zero);
