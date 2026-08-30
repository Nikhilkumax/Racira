import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const BENTO_DIR = 'C:/Racira/racira-nextjs/src/domains/pdf/lib/bento';

function getAllFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) results.push(...getAllFiles(full));
      else if (/\.(ts|js)$/.test(entry)) results.push(full);
    }
  } catch {}
  return results;
}

function convert(content, filePath) {
  const lines = content.split('\n');
  const out = [];
  let removedLines = 0;

  for (const line of lines) {
    // 1. Remove lucide-react / lucide imports entirely
    if (/from\s+['"]lucide-react['"]/.test(line)) { removedLines++; continue; }
    if (/from\s+['"]lucide['"]/.test(line)) { removedLines++; continue; }

    // 2. Remove createIcons() calls
    if (/^\s*createIcons\(\);?\s*$/.test(line)) { removedLines++; continue; }

    // 3. Remove showLoader/hideLoader calls (with optional chaining for callbacks)
    if (/^\s*showLoader\(/.test(line)) { removedLines++; continue; }
    if (/^\s*hideLoader\(/.test(line)) { removedLines++; continue; }
    
    // 4. Remove showAlert calls used for progress/status
    if (/^\s*showAlert\(/.test(line)) { removedLines++; continue; }

    // 5. Remove renderFileDisplay calls  
    if (/^\s*renderFileDisplay\(/.test(line)) { removedLines++; continue; }

    // 6. Remove createIcons import
    if (/import\s*\{[^}]*createIcons[^}]*\}\s*from/.test(line)) { removedLines++; continue; }

    let modified = line;

    // 7. Fix @/types imports
    modified = modified.replace(/from\s+['"]@\/types['"]/g, "from '../types'");
    modified = modified.replace(/from\s+['"]@\/types\/([^'"]+)['"]/g, "from '../types/$1'");

    // 8. Fix relative .js imports → strip extension (within bento local imports only)
    modified = modified.replace(/from\s+['"](\.\.?\/[^'"]+)\.js['"]/g, "from '$1'");

    // 9. Replace import.meta.env.BASE_URL
    modified = modified.replace(/import\.meta\.env\.BASE_URL/g, "'/'");

    // 10. Replace import.meta.env.VITE_* → process.env.NEXT_PUBLIC_*
    modified = modified.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');

    // 11. Replace import.meta.env (generic) → '{}'
    modified = modified.replace(/import\.meta\.env/g, '(typeof process !== "undefined" ? process.env : {} as Record<string, string | undefined>)');

    // 12. Remove /* @vite-ignore */ comments
    modified = modified.replace(/\/\*\s*@vite-ignore\s*\*\//g, '');

    out.push(modified);
  }

  return { content: out.join('\n'), removedLines };
}

const allFiles = getAllFiles(BENTO_DIR);
let totalConverted = 0;
let totalRemoved = 0;

for (const filePath of allFiles) {
  const content = readFileSync(filePath, 'utf-8');
  const { content: converted, removedLines } = convert(content, filePath);
  
  if (converted !== content) {
    writeFileSync(filePath, converted, 'utf-8');
    totalConverted++;
    totalRemoved += removedLines;
  }
}

console.log(`Mechanical conversion complete: ${totalConverted} files modified, ${totalRemoved} lines removed`);
