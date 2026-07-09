const fs = require('fs');
const path = require('path');

const categories = fs.readdirSync('src/app').filter(d => fs.statSync('src/app/'+d).isDirectory() && !d.startsWith('(') && !d.startsWith('site'));
const results = [];

for (const cat of categories) {
  let pagePath = 'src/app/'+cat+'/page.tsx';
  if (!fs.existsSync(pagePath)) continue;
  
  let content = fs.readFileSync(pagePath, 'utf8');
  let clientMatch = content.match(/from ["']@\/domains\/[^\/]+\/components\/([^"']+)["']/);
  let fileToCheck = pagePath;
  
  if (clientMatch && !content.includes('import { Search }')) {
    fileToCheck = 'src/domains/'+cat+'/components/'+clientMatch[1]+'.tsx';
    if (!fs.existsSync(fileToCheck) && fs.existsSync(fileToCheck.replace('.tsx', ''))) {
      // maybe it's a directory index?
    }
    if (fs.existsSync(fileToCheck)) {
      content = fs.readFileSync(fileToCheck, 'utf8');
    } else {
        // Just use pagePath content
        content = fs.readFileSync(pagePath, 'utf8');
        fileToCheck = pagePath;
    }
  }

  // Regex to find things like `import { tools } from "@/data/..."` or `import { CATEGORIES } from "@/domains/..."`
  const registryMatch = content.match(/import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g);
  
  let foundToolsVar = null;
  let importPath = null;
  
  if (registryMatch) {
      for (const m of registryMatch) {
          if (m.toLowerCase().includes('lucide')) continue;
          if (m.toLowerCase().includes('tool') || m.toLowerCase().includes('categor') || m.toLowerCase().includes('registry')) {
              // Extract the variable names inside { }
              const varsMatch = m.match(/\{([^}]+)\}/);
              if (varsMatch) {
                  const vars = varsMatch[1].split(',').map(v => v.trim());
                  // Prefer 'tools', 'TOOLS', 'audioCategories', etc.
                  for (const v of vars) {
                      if (v.toLowerCase().includes('tool') || v === 'CATEGORIES' || v === 'categories') {
                          foundToolsVar = v;
                          importPath = m.match(/from\s+['"]([^'"]+)['"]/)[1];
                          break;
                      }
                  }
              }
          }
          if (foundToolsVar) break;
      }
  }
  
  results.push({
    cat,
    fileToCheck,
    foundToolsVar,
    importPath
  });
}

fs.writeFileSync('scratch/registries.json', JSON.stringify(results, null, 2));
