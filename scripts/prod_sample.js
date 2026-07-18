const fs = require('fs');
const code = fs.readFileSync('src/data/productivity/tools.ts', 'utf8');
const regex = /name:\s*"([^"]+)".*?icon:\s*([A-Za-z0-9_]+)/g;
let match;
const map = [];
while ((match = regex.exec(code)) !== null) {
  map.push([match[1], match[2]]);
}
console.log('\n--- SAMPLE 15-20 ICONS ---');
console.log(map.slice(0, 20).map(m => m[0] + ' -> ' + m[1]).join('\n'));
console.log('\n--- ALIAS COLLISION CHECK ---');
const stripped = map.map(m => m[1].replace(/Icon$/, ''));
const set = new Set(stripped);
const hasDuplicates = set.size < map.length;
console.log('Alias duplicates found:', hasDuplicates ? 'YES' : 'NO');
if(hasDuplicates) {
  const counts = {};
  for(const s of stripped) counts[s] = (counts[s]||0)+1;
  console.log(Object.entries(counts).filter(x => x[1]>1));
}
