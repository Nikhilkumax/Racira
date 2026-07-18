const fs = require('fs');

const files = [
    'src/domains/calculator/components/PlasticFootprintCalculator.tsx',
    'src/domains/calculator/components/WaterFootprintCalculator.tsx'
];

let changed = 0;
for (const f of files) {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes('Calculate Footprint')) {
        content = content.replace(/Calculate Footprint/g, 'Calculate');
        fs.writeFileSync(f, content);
        console.log(`Fixed: ${f}`);
        changed++;
    } else {
        console.log(`No match: ${f}`);
    }
}
console.log(`Total files changed: ${changed}`);