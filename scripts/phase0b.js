const fs = require('fs');
const path = require('path');

const approvedPath = path.join(process.cwd(), 'src', 'calculators', '_approved.json');
let approvedData = { version: 1, description: "Calculators approved by owner after Polish or Rebuild. Exempt from re-flagging on detect re-runs.", approved: [] };

if (fs.existsSync(approvedPath)) {
    approvedData = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
}

const polishListPath = path.join(process.cwd(), 'polish_list.md');
if (fs.existsSync(polishListPath)) {
    const polishList = fs.readFileSync(polishListPath, 'utf8');
    const matches = polishList.match(/•\s([a-zA-Z0-9]+)\s—/g);
    if (matches) {
        matches.forEach(match => {
            const slug = match.replace('• ', '').replace(' —', '').trim();
            if (!approvedData.approved.includes(slug)) {
                approvedData.approved.push(slug);
            }
        });
    }
}

fs.writeFileSync(approvedPath, JSON.stringify(approvedData, null, 2), 'utf8');
console.log('Phase 0B: _approved.json updated.');
