const fs = require('fs');
const path = require('path');

const dir = 'c:\\Racira\\racira-nextjs\\src\\calculators';
const files = fs.readdirSync(dir);

let count = 0;
let patterns = new Set();

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<article className="prose-finance')) {
            // grab the previous 2 lines
            if (i >= 2) {
                let context = lines[i-2].trim() + '\n' + lines[i-1].trim() + '\n' + lines[i].trim();
                patterns.add(context);
            }
        }
    }
  }
}

console.log(Array.from(patterns).slice(0, 10).join('\n---\n'));
