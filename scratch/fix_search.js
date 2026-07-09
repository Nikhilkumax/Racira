const fs = require('fs');
const path = require('path');

const categories = fs.readdirSync('src/app').filter(d => fs.statSync('src/app/'+d).isDirectory() && !d.startsWith('(') && !d.startsWith('site') && d !== 'calculator');

const successful = [];
const failed = [];

for (const cat of categories) {
  let pagePath = 'src/app/'+cat+'/page.tsx';
  if (!fs.existsSync(pagePath)) continue;
  
  let content = fs.readFileSync(pagePath, 'utf8');
  let clientMatch = content.match(/from ["']@\/domains\/[^\/]+\/components\/([^"']+)["']/);
  let fileToCheck = pagePath;
  let isClientComponent = false;
  
  if (clientMatch && !content.includes('import { Search }')) {
    fileToCheck = 'src/domains/'+cat+'/components/'+clientMatch[1]+'.tsx';
    if (!fs.existsSync(fileToCheck) && fs.existsSync(fileToCheck.replace('.tsx', ''))) {
      fileToCheck = fileToCheck.replace('.tsx', '/index.tsx');
    }
    if (fs.existsSync(fileToCheck)) {
      content = fs.readFileSync(fileToCheck, 'utf8');
      isClientComponent = true;
    } else {
        content = fs.readFileSync(pagePath, 'utf8');
        fileToCheck = pagePath;
    }
  }

  // Regex to find the hero search bar
  const searchBarRegex = /<div className="relative w-full max-w-xl mx-auto">[\s\S]*?<div className="relative">[\s\S]*?<Search [\s\S]*?<input[\s\S]*?placeholder=["']([^"']+)["'][\s\S]*?<\/kbd>\s*<\/div>\s*<\/div>/;
  
  const match = content.match(searchBarRegex);
  if (!match) {
    failed.push({ cat, reason: 'No static search bar found' });
    continue;
  }
  
  const placeholder = match[1];
  
  // Find registry import
  const registryMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g);
  let toolsVar = null;
  
  if (registryMatch) {
      for (const m of registryMatch) {
          if (m.toLowerCase().includes('lucide')) continue;
          if (m.toLowerCase().includes('tool') || m.toLowerCase().includes('categor') || m.toLowerCase().includes('registry')) {
              const varsMatch = m.match(/\{([^}]+)\}/);
              if (varsMatch) {
                  const vars = varsMatch[1].split(',').map(v => v.trim().split(/\s+as\s+/)[0]);
                  for (const v of vars) {
                      if (v.toLowerCase().includes('tool') || v.toLowerCase().includes('categor')) {
                          toolsVar = v;
                          break;
                      }
                  }
              }
          }
          if (toolsVar) break;
      }
  }
  
  if (!toolsVar) {
      failed.push({ cat, reason: 'Could not find tools registry variable to bind' });
      continue;
  }
  
  // Try to generate the mapping logic based on standard patterns
  let mapLogic = `[]`;
  
  if (toolsVar.toLowerCase() === 'categories' || toolsVar.toLowerCase() === 'audiocategories' || toolsVar.toLowerCase() === 'videocategories') {
      // It's grouped by category: { name, tools: [] }
      mapLogic = `(Array.isArray(${toolsVar}) ? ${toolsVar}.flatMap(cat => (cat.tools || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: cat.name, icon: t.icon, isBuilt: t.built !== false }))) : [])`;
      if (cat === 'audio') {
         mapLogic = `(Array.isArray(${toolsVar}) ? ${toolsVar}.flatMap(cat => (cat.tools || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${cat.slug}/\${t.slug}\`, category: cat.name, icon: t.icon, isBuilt: t.built !== false }))) : [])`;
      }
      if (cat === 'business') {
         mapLogic = `(Array.isArray(${toolsVar}) ? ${toolsVar}.flatMap(cat => (cat.tools || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: cat.name, icon: t.icon, isBuilt: t.built !== false }))) : [])`;
      }
  } else if (toolsVar.toLowerCase() === 'tools') {
      // It's a flat array of tools: { name, slug, category }
      if (cat === 'developers') {
          mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.category}/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      } else {
          mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      }
  } else if (toolsVar === 'TOOLS') {
      if (cat === 'colors') {
          mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/colors/tools/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      } else if (cat === 'crypto' || cat === 'pdf') {
          mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      } else {
          mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      }
  } else {
      failed.push({ cat, reason: 'Unknown registry variable structure: ' + toolsVar });
      continue;
  }
  
  // For engineering/security, we need to remove the unused query state if it exists
  if (cat === 'engineering' || cat === 'security') {
      content = content.replace(/const\s+\[(query|q),\s+set(?:Query|Q)\]\s*=\s*useState\([^)]+\);\n?/g, '');
      // Remove unused useState import if no longer used? Too complex, just leave it or let linter handle.
  }
  
  // Inject the CategorySearch import if missing
  if (!content.includes('import { CategorySearch }')) {
      // find last import
      const lastImportIndex = content.lastIndexOf('import ');
      const eol = content.indexOf('\\n', lastImportIndex);
      content = content.replace(/import { Search } from "lucide-react";\s*/, '');
      content = `import { CategorySearch } from "@/components/CategorySearch";\n` + content;
  }
  
  // Replace the search bar
  const replacement = '<CategorySearch categorySlug="' + cat + '" placeholder="' + placeholder + '" registry={' + mapLogic + '} />';
  content = content.replace(searchBarRegex, replacement);
  
  // Also apply tool counts!
  if (cat === 'developers') {
      content = content.replace(/6\+\s*Free/g, '290+ Free');
      content = content.replace(/Search 6\+/g, 'Search 290+');
  } else if (cat === 'audio') {
      content = content.replace(/270\+\s*Free/g, '230+ Free');
      content = content.replace(/Search 270\+/g, 'Search 230+');
  } else if (cat === 'productivity') {
      content = content.replace(/80\+\s*Free/g, '74+ Free');
      content = content.replace(/Search 80\+/g, 'Search 74+');
  } else if (cat === '3d') {
      content = content.replace(/15\+\s*Free/g, '120+ Free');
      content = content.replace(/Search 15\+/g, 'Search 120+');
  } else if (cat === 'engineering') {
      content = content.replace(/150\+\s*Free/g, '138+ Free');
      content = content.replace(/Search 150\+/g, 'Search 138+');
  }
  
  fs.writeFileSync(fileToCheck, content);
  successful.push({ cat, file: fileToCheck, toolsVar });
}

fs.writeFileSync('scratch/search_fix_report.json', JSON.stringify({ successful, failed }, null, 2));
