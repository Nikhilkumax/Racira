const fs = require('fs');
const content = fs.readFileSync('src/data/calculators/health.ts', 'utf8');
const lines = content.split('\n');
const pending = lines
  .filter(line => line.includes('isBuilt: false'))
  .map(line => {
    const match = line.match(/slug: ["'](.*?)["']/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

console.log(pending.slice(0, 10));
