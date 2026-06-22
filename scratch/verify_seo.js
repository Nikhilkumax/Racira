const fs = require('fs');
const path = require('path');

const dir = 'c:\\Racira\\racira-nextjs\\src\\calculators';
const files = fs.readdirSync(dir);

let missingCount = 0;

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('prose-finance')) {
      if (!content.includes('text-[15.75px]')) {
        console.log(`File missing 15.75px: ${file}`);
        
        // Find the exact line
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('prose-finance')) {
            console.log(`  Line ${i+1}: ${lines[i].trim()}`);
          }
        }
        missingCount++;
      }
    }
  }
}

if (missingCount === 0) {
  console.log('All calculators with prose-finance have the text-[15.75px] class.');
} else {
  console.log(`Found ${missingCount} files that need updating.`);
}
