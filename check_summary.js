const fs = require('fs');
const r = require('./detect_results_v3_master.json');
console.log('Keys:', Object.keys(r));
console.log('keep:', (r.keep || []).length);
console.log('polish:', (r.polish || []).length);
console.log('rebuild:', (r.rebuild || []).length);
console.log('create:', (r.create || []).length);
if (r.summary) console.log('summary:', JSON.stringify(r.summary, null, 2));
if (r.stats) console.log('stats:', JSON.stringify(r.stats, null, 2));
// Check categories of polish
const cats = {};
r.polish.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
console.log('polish by category:', JSON.stringify(cats));
// Check rebuild
if (r.rebuild) {
    const rcats = {};
    r.rebuild.forEach(p => { rcats[p.category] = (rcats[p.category] || 0) + 1; });
    console.log('rebuild by category:', JSON.stringify(rcats));
    console.log('rebuild sample:', r.rebuild.slice(0, 5).map(p => p.file + '|' + p.name));
}