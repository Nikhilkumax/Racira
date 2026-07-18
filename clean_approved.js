const fs = require('fs');
const path = require('path');

const stubs = fs.readFileSync('stub_list.txt', 'utf8').split('\n').filter(Boolean);
const approvedPath = 'src/domains/calculator/components/_approved.json';
const approvedData = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));

const initialCount = approvedData.approved.length;
approvedData.approved = approvedData.approved.filter(slug => !stubs.includes(slug));
const finalCount = approvedData.approved.length;

fs.writeFileSync(approvedPath, JSON.stringify(approvedData, null, 2) + '\n', 'utf8');

console.log(`Removed ${initialCount - finalCount} stubs from _approved.json`);
