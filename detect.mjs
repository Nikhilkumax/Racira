import fs from 'fs';
import path from 'path';

const calculatorsDir = path.join(process.cwd(), 'src', 'calculators');
const registryFile = path.join(process.cwd(), 'src', 'data', 'calculatorRegistry.ts');

const registryContent = fs.readFileSync(registryFile, 'utf8');

// Rough extract of registry to check isBuilt
// But actually, calculatorRegistry imports from calculators/finance, business, etc.
// Let's just run ts-node or just use regex to check files directly, or we can compile the registry.
// To keep it simple, let's just analyze the files directly for now.

const files = fs.readdirSync(calculatorsDir).filter(f => f.endsWith('.tsx'));

let keep = 0;
let rebuild = 0;
let total = files.length;

let rebuildList = [];

files.forEach(file => {
  const filePath = path.join(calculatorsDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = stats.size / 1024;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  let needsRebuild = false;
  let reason = [];

  if (sizeKB < 8) {
    needsRebuild = true;
    reason.push('Size < 8KB');
  }

  if (!content.includes('recharts')) {
    needsRebuild = true;
    reason.push('No recharts');
  }

  // Rough check for SEO content length by counting words outside of tags if possible, 
  // or just total file size if < 15KB it might lack 1500 words
  if (content.split(' ').length < 1500) {
    needsRebuild = true;
    reason.push('Too few words (< 1500)');
  }
  
  if (content.includes('Value A') || content.includes('Value B')) {
    needsRebuild = true;
    reason.push('Generic inputs');
  }

  if (needsRebuild) {
    rebuild++;
    rebuildList.push({ file, reason });
  } else {
    keep++;
  }
});

console.log(`Total: ${total} | ✅ Keep: ${keep} | 🔴 Rebuild: ${rebuild}`);
