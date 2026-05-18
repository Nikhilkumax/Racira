
const fs = require('fs');
const path = require('path');

const dir = 'src/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Ensure reset function exists if it's called in onClick
    if (content.includes('onClick={reset}') && !content.includes('const reset =')) {
        // Find handleCalculate and insert reset after it
        const handleCalcMatch = content.match(/const handleCalculate = \(\) => \{[\s\S]*?\n  \};/);
        const handleCalcMatch2 = content.match(/const handleCalculate = \(\) => \{[\s\S]*?\n\};/);
        const match = handleCalcMatch || handleCalcMatch2;
        
        if (match) {
            const insertPos = match.index + match[0].length;
            const resetHtml = `\n\n  const reset = () => {\n    setShowResults(false);\n    setResults(null);\n  };`;
            content = content.slice(0, insertPos) + resetHtml + content.slice(insertPos);
        } else {
             // Fallback: insert before handleCalculate
             const handleCalcStart = content.indexOf('const handleCalculate =');
             if (handleCalcStart !== -1) {
                 const resetHtml = `const reset = () => {\n    setShowResults(false);\n    setResults(null);\n  };\n\n  `;
                 content = content.slice(0, handleCalcStart) + resetHtml + content.slice(handleCalcStart);
             }
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added reset function to ${file}`);
    }
});
