const fs = require('fs');
const r = require('./detect_results_v3_master.json');
const noCalc = [
    'AverageRevenuePerUserCalculator.tsx',
    'DogWalkCalorieBurnCalculator.tsx',
    'BaristaFireCalculator.tsx',
    'TirePressureCalculator.tsx',
    'EllipticalCalorieCalculator.tsx',
    'VaccinationScheduleCalculator.tsx',
];
noCalc.forEach(f => {
    const t = fs.readFileSync('src/domains/calculator/components/' + f, 'utf8');
    const m = t.match(/<button[\s\S]*?<\/button>/g) || [];
    console.log('=== ' + f + ' (' + m.length + ' buttons) ===');
    m.forEach((b, i) => {
        console.log('--- button ' + i + ' ---');
        console.log(b.slice(0, 400));
    });
});