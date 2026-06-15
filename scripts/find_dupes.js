const fs = require('fs');
let c = fs.readFileSync('src/app/calculator/[slug]/page.tsx', 'utf8');
const counts = {};
for (const m of c.matchAll(/"([^"]+)":/g)) {
  counts[m[1]] = (counts[m[1]] || 0) + 1;
}
for (const [k, v] of Object.entries(counts)) {
  if (v > 1) console.log(k);
}
