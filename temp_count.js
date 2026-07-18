const fs = require('fs');
const files = fs.readdirSync('src/domains/calculator/registry').filter(f => f.endsWith('.ts'));
let total = 0, live = 0, soon = 0;
for (const f of files) {
    const c = fs.readFileSync('src/domains/calculator/registry/' + f, 'utf8');
    const m = c.match(/status:\s*"(live|soon)"/g) || [];
    total += m.length;
    live += (c.match(/status:\s*"live"/g) || []).length;
    soon += (c.match(/status:\s*"soon"/g) || []).length;
}
console.log('Total registry entries:', total, '| live:', live, '| soon:', soon);