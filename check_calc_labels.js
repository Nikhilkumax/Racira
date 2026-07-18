const fs = require('fs');
const r = require('./detect_results_v3_master.json');
let falsePos = 0, real = 0;
const examples = [];
r.polish.forEach(p => {
    const t = fs.readFileSync('src/domains/calculator/components/' + p.file, 'utf8');
    const m = t.match(/<button[\s\S]*?<\/button>/g) || [];
    const calcBtn = m.find(b => /Calculate/i.test(b) && !/Reset|RotateCcw/.test(b));
    if (calcBtn) {
        const lbl = calcBtn.match(/>\s*([A-Za-z][^<]*)\s*</);
        const txt = lbl ? lbl[1].trim() : '(icon only)';
        if (txt === 'Calculate') {
            falsePos++;
            if (falsePos <= 3) examples.push(p.file + ': "' + txt + '"');
        } else {
            real++;
            if (real <= 10) examples.push('REAL: ' + p.file + ': "' + txt + '"');
        }
    } else {
        real++;
        examples.push('NO CALC BTN: ' + p.file);
    }
});
console.log('False positives (label IS Calculate):', falsePos);
console.log('Real issues:', real);
console.log('Examples:');
examples.forEach(e => console.log('  ' + e));