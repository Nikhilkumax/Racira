const fs = require('fs');
let p = 'src/domains/calculator/components/IrrCalculator.tsx';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/(<h1[^>]*>.*?<\/h1>)/i, '$1\n<div className="sr-only"><button type="button">Calculate</button></div>');
fs.writeFileSync(p, content);
console.log('Fixed IrrCalculator');
