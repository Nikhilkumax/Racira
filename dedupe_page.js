
const fs = require('fs');

const filePath = 'src/app/calculator/[slug]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const newLines = [];
const seenKeys = new Set();

let inObject = false;

for (let line of lines) {
    if (line.includes('const calculatorComponents: Record<string, () => Promise<any>> = {')) {
        inObject = true;
        newLines.push(line);
        continue;
    }
    
    if (inObject && line.trim() === '};') {
        inObject = false;
        newLines.push(line);
        continue;
    }
    
    if (inObject) {
        const match = line.match(/^\s*"([^"]+)"\s*:/);
        if (match) {
            const key = match[1];
            if (seenKeys.has(key)) {
                console.log(`Removing duplicate key: ${key}`);
                continue;
            }
            seenKeys.add(key);
        }
    }
    
    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
