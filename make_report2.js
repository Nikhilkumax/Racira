const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Racira\\racira-nextjs';
const appDir = path.join(rootDir, 'src', 'app');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      fileList = walk(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allPages = walk(appDir);
let bucketA = [];
let bucketB = [];
let bucketC = [];

function resolveImport(importPath, currentDir) {
  let targetBase = '';
  if (importPath.startsWith('@/')) {
    targetBase = path.join(rootDir, 'src', importPath.slice(2));
  } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
    targetBase = path.resolve(currentDir, importPath);
  } else {
    return null;
  }

  const extensions = ['.tsx', '.ts', '/index.tsx', '/index.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    if (fs.existsSync(targetBase + ext)) {
      return targetBase + ext;
    }
  }
  if (fs.existsSync(targetBase) && fs.statSync(targetBase).isFile()) {
     return targetBase;
  }
  return null;
}

for (const page of allPages) {
  let content = fs.readFileSync(page, 'utf8');
  if (content.includes('racira-page-container')) {
    bucketA.push({ page, reason: 'Directly' });
    continue;
  }

  const importRegex = /import\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g;
  let match;
  let importedFiles = [];
  while ((match = importRegex.exec(content)) !== null) {
    importedFiles.push(match[1]);
  }

  const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    importedFiles.push(match[1]);
  }

  let foundInImport = false;
  let resolvedAny = false;
  for (const importPath of importedFiles) {
    const resolved = resolveImport(importPath, path.dirname(page));
    if (resolved) {
      resolvedAny = true;
      const importedContent = fs.readFileSync(resolved, 'utf8');
      if (importedContent.includes('racira-page-container')) {
        foundInImport = true;
        break;
      }
    }
  }

  if (foundInImport) {
    bucketA.push({ page, reason: 'Via import' });
  } else {
    const classMatch = content.match(/className=["']([^"']+)["']/);
    const firstClass = classMatch ? classMatch[1] : 'None or complex';
    
    if (firstClass === 'None or complex') {
      bucketC.push({ page, firstClass });
    } else {
      bucketB.push({ page, firstClass });
    }
  }
}

console.log('Total pages:', allPages.length);
console.log('Bucket A (False Positives):', bucketA.length);
console.log('Bucket B (True Gaps):', bucketB.length);
console.log('Bucket C (Unclear / Complex):', bucketC.length);

console.log('\n--- BUCKET B ---');
for (const item of bucketB) {
  console.log(`${path.relative(rootDir, item.page).replace(/\\/g, '/')} | First class: ${item.firstClass}`);
}

console.log('\n--- BUCKET C ---');
for (const item of bucketC) {
  console.log(`${path.relative(rootDir, item.page).replace(/\\/g, '/')} | First class: ${item.firstClass}`);
}
