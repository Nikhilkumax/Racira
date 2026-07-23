const fs = require('fs');
const path = require('path');
const compDir = path.join(process.cwd(), 'src', 'domains', 'calculator', 'components');
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));

function wc(t){return t.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/\{\{[^}]*\}\}/g,' ').replace(/\{[^}]*\}/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean).length;}

const out = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(compDir, f), 'utf8');
  const h2Count = (text.match(/<h2\b/g) || []).length;
  const h2Locked = (text.match(/<h2 className="text-2xl font-bold mb-3"/g) || []).length;
  const hasProse = /prose-finance|mt-12 space-y-8/.test(text);
  // estimate SEO words: find last occurrence of locked h2 and capture rest of file (FAQ+prose)
  const idx = text.lastIndexOf('text-2xl font-bold mb-3');
  let seoWc = 0;
  if (idx !== -1) {
    const secStart = text.lastIndexOf('<section', idx);
    const start = secStart !== -1 ? secStart : idx;
    seoWc = wc(text.slice(start));
  }
  out.push({ f, h2Count, h2Locked, hasProse, seoWc });
}
out.sort((a,b)=>a.seoWc-b.seoWc);
const over = out.filter(x=>x.seoWc>=1500).length;
const mid = out.filter(x=>x.seoWc>=800&&x.seoWc<1500).length;
const under = out.filter(x=>x.seoWc<800).length;
const zero = out.filter(x=>x.seoWc===0).length;
const noH2L = out.filter(x=>x.h2Locked===0).length;
console.log('TOTAL:', files.length);
console.log('Files with >=1 locked h2:', files.length-noH2L, '| files with ZERO locked h2:', noH2L);
console.log('SEO est >=1500:', over, '| 800-1499:', mid, '| <800:', under, '| 0:', zero);
console.log('\nLowest 20 (no locked h2 files first):');
out.filter(x=>x.h2Locked===0).slice(0,20).forEach(x=>console.log('  h2='+x.h2Count, x.f));
console.log('\nLowest 20 with h2:');
out.filter(x=>x.h2Locked>0).slice(0,20).forEach(x=>console.log('  ', x.seoWc, 'h2='+x.h2Count, x.f));
fs.writeFileSync(path.join(process.cwd(),'scripts','seo2.json'), JSON.stringify(out,null,2));
