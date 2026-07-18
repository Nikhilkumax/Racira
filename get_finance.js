const fs = require('fs');
const path = require('path');
const REGISTRY_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'registry');
const COMPS_DIR = path.join(__dirname, 'src', 'domains', 'calculator', 'components');

const stubs = fs.readFileSync('stub_list.txt', 'utf8').split('\n').filter(Boolean);

const financeSlugs = [];
const content = fs.readFileSync(path.join(REGISTRY_DIR, 'finance.ts'), 'utf8');
const matches = [...content.matchAll(/slug:\s*["']([^"']+)["']/g)];
for (const m of matches) financeSlugs.push(m[1]);

const financeStubs = stubs.filter(stub => {
    const slug = stub.replace('Calculator', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-calculator';
    const slug2 = stub.replace('Calculator', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return financeSlugs.includes(slug) || financeSlugs.includes(slug2);
});

financeStubs.sort();
console.log('Finance Stubs:');
console.log(financeStubs.slice(0, 4));

// Update Approved list with Batch 1
const approvedPath = path.join(COMPS_DIR, '_approved.json');
const approvedData = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
const batch1 = ['AngleConverterAdvanced', 'AnovaCalculator', 'AntilogCalculator', 'ApScoreCalculator'];
batch1.forEach(c => {
    if (!approvedData.approved.includes(c)) approvedData.approved.push(c);
});
fs.writeFileSync(approvedPath, JSON.stringify(approvedData, null, 2) + '\n');
console.log('Updated _approved.json with Batch 1');
