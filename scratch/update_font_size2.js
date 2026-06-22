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
    
    // Replace text-[anypx] with text-[15.75px] (which is a 5% increase over 15px)
    content = content.replace(/className="prose-finance text-\[[0-9.]+px\]"/g, 'className="prose-finance text-[15.75px]"');
    // Also handle if there's no text-[...] class
    content = content.replace(/className="prose-finance"/g, 'className="prose-finance text-[15.75px]"');
    // Deduplicate if we accidentally created "prose-finance text-[15.75px] text-[15.75px]"
    content = content.replace(/className="prose-finance text-\[15\.75px\] text-\[15\.75px\]"/g, 'className="prose-finance text-[15.75px]"');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedFilesCount++;
    }
  }
}

console.log(`Successfully updated SEO text size to 15.75px (5% increase over 15px) in ${updatedFilesCount} calculator files.`);
