const fs = require('fs');
const path = require('path');

const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

function wordCount(text) {
  const stripped = text
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.split(' ').filter(Boolean).length;
}

const seo = [];
let noSeoTag = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(compDir, f), 'utf8');
  // Find all <section ...> blocks that look like SEO prose (contain multiple h2)
  const secRe = /<section\b[^>]*>([\s\S]*?)<\/section>/g;
  let m, best = '';
  while ((m = secRe.exec(text)) !== null) {
    const block = m[0];
    const h2count = (block.match(/<h2/g) || []).length;
    if (h2count >= 3 && block.length > best.length) best = block;
  }
  if (!best) { noSeoTag++; seo.push({ f, wc: 0, h2: 0 }); continue; }
  const h2 = (best.match(/<h2/g) || []).length;
  seo.push({ f, wc: wordCount(best), h2 });
}

seo.sort((a,b)=>a.wc-b.wc);
const over = seo.filter(x=>x.wc>=1500).length;
const mid = seo.filter(x=>x.wc>=800&&x.wc<1500).length;
const under = seo.filter(x=>x.wc<800).length;
const zero = seo.filter(x=>x.wc===0).length;
const noH2 = seo.filter(x=>x.h2<3 && x.wc>0).length;
console.log('TOTAL:', files.length);
console.log('SEO wc >=1500:', over, '| 800-1499:', mid, '| <800:', under, '| 0 (no prose section):', zero);
console.log('Sections w/ <3 h2 but prose present:', noH2);
console.log('\nLowest 30:');
seo.slice(0,30).forEach(x=>console.log('  ', x.wc, 'h2='+x.h2, x.f));
console.log('\nHighest 10:');
seo.slice(-10).reverse().forEach(x=>console.log('  ', x.wc, x.f));
fs.writeFileSync(path.join(process.cwd(),'scripts','seo_audit.json'), JSON.stringify(seo,null,2));
