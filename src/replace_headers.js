const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:\\Racira\\racira-nextjs\\src\\app');

function scanDir(dir, results) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, results);
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
}

const allFiles = [];
scanDir(srcDir, allFiles);

// A map to properly format the category name
const formatCategory = (dirName) => {
  if (dirName === 'pdf') return 'PDF';
  if (dirName === '3d') return '3D';
  if (dirName === 'tts') return 'TTS';
  if (dirName === 'seo') return 'SEO';
  return dirName.charAt(0).toUpperCase() + dirName.slice(1).replace(/-/g, ' ');
};

let modifiedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Identify the category from the path (e.g. app/fitness/page.tsx -> fitness)
  const relPath = file.substring(srcDir.length + 1).replace(/\\/g, '/');
  const parts = relPath.split('/');
  let categoryDir = parts[0];
  if (categoryDir === '(home)') categoryDir = 'homepage'; // Will just use <Header />
  
  let catName = formatCategory(categoryDir);

  // Match the header components being used in this file
  const headerComponents = ['SiteHeader', 'CalcHeader', 'TTSHeader']; 
  // 'Header' is special because it might already be the unified Header.
  
  // We'll also look for 'Header' if it's imported from somewhere other than "@/components/Header"
  const isOldHeaderImport = /import\s+.*Header.*\s+from\s+["']@\/components\/(?!Header["']).*["']/.test(content);
  
  let usedHeaderComponent = null;

  if (content.includes('<SiteHeader')) usedHeaderComponent = 'SiteHeader';
  else if (content.includes('<CalcHeader')) usedHeaderComponent = 'CalcHeader';
  else if (content.includes('<TTSHeader')) usedHeaderComponent = 'TTSHeader';
  else if (content.includes('<Header') && isOldHeaderImport) usedHeaderComponent = 'Header';

  if (usedHeaderComponent) {
    // 1. Replace the JSX tag
    const jsxRegex = new RegExp(`<${usedHeaderComponent}[^>]*>`, 'g');
    const replacementJsx = categoryDir === 'homepage' 
      ? `<Header />` 
      : `<Header mode="category" categoryName="${catName}" />`;
    
    content = content.replace(jsxRegex, replacementJsx);
    // Also replace self-closing tags just in case there was a space
    content = content.replace(new RegExp(`<${usedHeaderComponent}\\s*/>`, 'g'), replacementJsx);

    // 2. Handle the imports
    // Case A: Default import (import CalcHeader from ...) or named import alone
    const importRegexA = new RegExp(`import\\s+${usedHeaderComponent}\\s+from\\s+["'][^"']+["'];?\\n?`, 'g');
    const importRegexB = new RegExp(`import\\s+\\{\\s*${usedHeaderComponent}\\s*\\}\\s+from\\s+["'][^"']+["'];?\\n?`, 'g');
    
    content = content.replace(importRegexA, '');
    content = content.replace(importRegexB, '');

    // Case C: Destructured import with others (import { SiteHeader, SiteFooter } from ...)
    const importRegexC = new RegExp(`(import\\s+\\{[^\}]*)(\\b${usedHeaderComponent}\\b\\s*,?\\s*)([^\}]*\\}\\s+from\\s+["'][^"']+["'];?)`, 'g');
    content = content.replace(importRegexC, (match, p1, p2, p3) => {
      // Clean up the comma
      let newP1 = p1.trim();
      if (newP1.endsWith(',')) newP1 = newP1.slice(0, -1);
      return newP1 + ' ' + p3;
    });
    // Further cleanup if it resulted in import { , SiteFooter }
    content = content.replace(/{\s*,\s*/g, '{ ');

    // 3. Add the unified Header import if not already present
    if (!content.includes('import Header from "@/components/Header"')) {
      // Insert after the first import or at the top
      if (content.includes('import ')) {
        content = content.replace(/import [^\n]+\n/, (match) => {
          return match + 'import Header from "@/components/Header";\n';
        });
      } else {
        content = 'import Header from "@/components/Header";\n' + content;
      }
    }
  }

  // Edge case for app/(home)/layout.tsx or others that already use <Header /> but it's the correct one
  if (categoryDir !== 'homepage' && content.includes('<Header />') && content.includes('import Header from "@/components/Header"')) {
    // It's using the unified header but without mode="category"!
    // Let's replace it
    content = content.replace(/<Header \/>/g, `<Header mode="category" categoryName="${catName}" />`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Modified ${modifiedCount} files.`);
