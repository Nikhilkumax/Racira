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
    
    // 1. Standardize the SEO container to max-w-[1180px] mx-auto mt-8
    // Pattern: <div className="max-w-[something] mx-auto mt-[something]"> \n <AdPlaceholder ... /> \n <article
    // We can use a regex to match the wrapper div of the prose-finance article.
    
    const regex = /<div className="max-w-(?:\[\d+px\]|\w+)\s+mx-auto\s+mt-\d+">\s*(?:<AdPlaceholder[^>]*>\s*)?<article className="prose-finance/g;
    
    content = content.replace(regex, (match) => {
        // Replace the div class
        return match.replace(/max-w-(?:\[\d+px\]|\w+)\s+mx-auto\s+mt-\d+/, 'max-w-[1180px] mx-auto mt-8');
    });

    // 2. Standardize the article class to include text-[15px] and remove max-w-none
    content = content.replace(/<article className="prose-finance( max-w-none)?"/g, '<article className="prose-finance text-[15px]"');

    // Make sure we didn't duplicate text-[15px] if it was already there (like in PMI and Mortgage)
    content = content.replace(/className="prose-finance text-\[15px\] text-\[15px\]"/g, 'className="prose-finance text-[15px]"');
    // Handle case where we might have accidentally replaced it in a way that creates prose-finance text-[15px] max-w-none
    content = content.replace(/className="prose-finance text-\[15px\] max-w-none"/g, 'className="prose-finance text-[15px]"');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedFilesCount++;
    }
  }
}

console.log(`Successfully updated SEO sizes and margins in ${updatedFilesCount} calculator files.`);
