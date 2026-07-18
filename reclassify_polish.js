const fs = require('fs');
const r = require('./detect_results_v3_master.json');

// For each polish item, determine the TRUE status
let trueKeep = 0;
let truePolish = 0;
let trueRebuild = 0;
const polishList = [];
const reclassList = [];

r.polish.forEach(p => {
    const t = fs.readFileSync('src/domains/calculator/components/' + p.file, 'utf8');
    const buttons = t.match(/<button[\s\S]*?<\/button>/g) || [];

    // Find the calculate button: has onClick that calls calculate/handleCalculate/calc, NOT reset/toggle
    const calcBtn = buttons.find(b => {
        const hasCalc = /onClick=\{(handleCalculate|calculate|calc|onCalculate|handleCalc)\}/.test(b);
        const isReset = /Reset|RotateCcw|handleReset|reset/i.test(b);
        const isToggle = /showAdvanced|setUnitSystem|toggle/i.test(b);
        const isPrint = /Print|handlePrint|Printer/i.test(b);
        return hasCalc && !isReset && !isToggle && !isPrint;
    });

    // Also check for buttons with text "Calculate" but different onClick patterns
    const calcBtnByText = buttons.find(b => {
        const hasText = />\s*Calculate\s*</.test(b);
        const isReset = /RotateCcw|handleReset/i.test(b);
        return hasText && !isReset;
    });

    const actualCalcBtn = calcBtn || calcBtnByText;

    if (actualCalcBtn) {
        // Extract label text
        const lbl = actualCalcBtn.match(/>\s*([A-Za-z][^<]*)\s*</);
        const txt = lbl ? lbl[1].trim() : '(icon only)';

        if (txt === 'Calculate') {
            // False positive - already correct
            trueKeep++;
        } else {
            // Has calculate button but wrong label - genuine Polish
            truePolish++;
            polishList.push(p.name + ' — label is "' + txt + '"');
        }
    } else {
        // No calculate button at all - Rebuild per spec
        trueRebuild++;
        reclassList.push(p.file + '|' + p.name + '|Missing Calculate button');
    }
});

console.log('=== RECLASSIFICATION OF 120 POLISH ITEMS ===');
console.log('Already correct (→ Keep):', trueKeep);
console.log('Genuine Polish (wrong label):', truePolish);
console.log('Should be Rebuild (no Calculate btn):', trueRebuild);
console.log('');
console.log('=== GENUINE POLISH LIST ===');
polishList.forEach(x => console.log('  ' + x));
console.log('');
console.log('=== RECLASSIFY TO REBUILD ===');
reclassList.forEach(x => console.log('  ' + x));