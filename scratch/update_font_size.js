const fs = require('fs');
const path = require('path');

const dir = 'c:\\Racira\\racira-nextjs\\src\\calculators';
const files = fs.readdirSync(dir);

let updatedFilesCount = 0;

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace text-[15px] with text-[16px]
    // 16px is ~6.6% larger than 15px, effectively a 5% increase visually.
    content = content.replace(/className="prose-finance text-\[15px\]"/g, 'className="prose-finance text-[16px]"');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedFilesCount++;
    }
  }
}

console.log(`Successfully increased SEO text size to 16px in ${updatedFilesCount} calculator files.`);
