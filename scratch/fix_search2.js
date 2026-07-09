const fs = require('fs');
const path = require('path');

const categories = fs.readdirSync('src/app').filter(d => fs.statSync('src/app/'+d).isDirectory() && !d.startsWith('(') && !d.startsWith('site') && d !== 'calculator');

const successful = [];
const failed = [];

const MAPPINGS = {
  '3d': { file: 'src/app/3d/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/3d/registry' },
  'animator': { file: 'src/app/animator/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/animator/registry' },
  'audio': { file: 'src/app/audio/page.tsx', var: 'audioCategories', type: 'grouped', import: '@/data/audio/audioTools' },
  'business': { file: 'src/domains/business/components/SiteHeader.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/business/registry' },
  'cad': { file: 'src/app/cad/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/cad/registry' },
  'colors': { file: 'src/domains/colors/components/home-client.tsx', var: 'TOOLS', type: 'flat', import: '@/domains/colors/registry' },
  'crypto': { file: 'src/app/crypto/page.tsx', var: 'TOOLS', type: 'flat', import: '@/domains/crypto/registry' },
  'design': { file: 'src/app/design/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/design/registry' },
  'developers': { file: 'src/app/developers/page.tsx', var: 'tools', type: 'flat', import: '@/data/developers/tools' },
  'education': { file: 'src/app/education/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/education/registry' },
  'engineering': { file: 'src/app/engineering/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/engineering/registry' },
  'finance': { file: 'src/app/finance/page.tsx', var: 'listCategories', type: 'grouped', import: '@/domains/finance/registry' },
  'fitness': { file: 'src/app/fitness/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/fitness/registry' },
  'flowchart': { file: 'src/app/flowchart/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/flowchart/registry' },
  'games': { file: 'src/app/games/page.tsx', var: 'getCategories', type: 'dynamic', import: '@/domains/games/registry' }, // Might be dynamic!
  'image': { file: 'src/app/image/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/image/registry' },
  'insight': { file: 'src/app/insight/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/insight/registry' },
  'maps': { file: 'src/app/maps/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/maps/registry' },
  'music': { file: 'src/app/music/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/music/registry' },
  'pdf': { file: 'src/domains/pdf/components/PDFHero.tsx', var: 'TOOLS', type: 'flat', import: '@/domains/pdf/registry' },
  'photo': { file: 'src/app/photo/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/photo/registry' },
  'presentation': { file: 'src/app/presentation/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/presentation/registry' },
  'productivity': { file: 'src/app/productivity/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/productivity/registry' },
  'security': { file: 'src/app/security/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/security/registry' },
  'seo': { file: 'src/app/seo/page.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/seo/registry' },
  'travel': { file: 'src/domains/travel/components/home-client.tsx', var: 'CATEGORIES', type: 'grouped', import: '@/domains/travel/registry' },
  'typography': { file: 'src/app/typography/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/typography/registry' },
  'video': { file: 'src/app/video/page.tsx', var: 'videoCategories', type: 'grouped', import: '@/data/video/tools' },
  'voice': { file: 'src/app/voice/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/voice/registry' },
  'writing': { file: 'src/app/writing/page.tsx', var: 'categories', type: 'grouped', import: '@/domains/writing/registry' }
};

for (const cat of categories) {
  const mapConfig = MAPPINGS[cat];
  if (!mapConfig) {
      failed.push({ cat, reason: 'No mapping config defined' });
      continue;
  }
  
  if (mapConfig.type === 'dynamic') {
      failed.push({ cat, reason: 'Registry is dynamically generated (cannot static wire without extra work)' });
      continue;
  }
  
  let fileToCheck = mapConfig.file;
  
  if (!fs.existsSync(fileToCheck)) {
      if (fs.existsSync('src/app/'+cat+'/page.tsx')) {
         fileToCheck = 'src/app/'+cat+'/page.tsx';
      } else {
         failed.push({ cat, reason: 'File does not exist: ' + fileToCheck });
         continue;
      }
  }

  let content = fs.readFileSync(fileToCheck, 'utf8');

  // Regex to find the hero search bar - make it robust against slight HTML variations!
  let searchBarRegex = /<div[^>]*className="relative w-full max-w-xl mx-auto"[^>]*>[\s\S]*?<div className="relative">[\s\S]*?<Search[\s\S]*?<input[\s\S]*?placeholder=["']([^"']+)["'][\s\S]*?<\/kbd>\s*<\/div>\s*<\/div>/;
  
  // Alternative for components that don't wrap it in max-w-xl directly (e.g. they use max-w-2xl)
  if (!content.match(searchBarRegex)) {
      searchBarRegex = /<div[^>]*className="relative w-full max-w-[a-z]+ mx-auto"[^>]*>[\s\S]*?<div className="relative">[\s\S]*?<Search[\s\S]*?<input[\s\S]*?placeholder=["']([^"']+)["'][\s\S]*?<\/kbd>\s*<\/div>\s*<\/div>/;
  }
  
  const match = content.match(searchBarRegex);
  if (!match) {
    failed.push({ cat, reason: 'No static search bar found in ' + fileToCheck });
    continue;
  }
  
  const placeholder = match[1];
  const toolsVar = mapConfig.var;
  
  let mapLogic = `[]`;
  if (mapConfig.type === 'grouped') {
      mapLogic = `(Array.isArray(${toolsVar}) ? ${toolsVar}.flatMap(cat => (cat.tools || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: cat.name, icon: t.icon, isBuilt: t.built !== false }))) : [])`;
      if (cat === 'audio') mapLogic = `(Array.isArray(${toolsVar}) ? ${toolsVar}.flatMap(cat => (cat.tools || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${cat.slug}/\${t.slug}\`, category: cat.name, icon: t.icon, isBuilt: t.built !== false }))) : [])`;
  } else if (mapConfig.type === 'flat') {
      mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      if (cat === 'developers') mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/tools/\${t.category}/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      if (cat === 'colors') mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/colors/tools/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
      if (cat === 'crypto' || cat === 'pdf') mapLogic = `(${toolsVar} || []).map(t => ({ name: t.name, description: t.description || '', slug: t.slug, href: t.slug.startsWith('/') ? t.slug : \`/${cat}/\${t.slug}\`, category: t.category, icon: t.icon, isBuilt: t.built !== false }))`;
  }
  
  // Strip unused state
  if (cat === 'engineering' || cat === 'security') {
      content = content.replace(/const\s+\[(?:query|q),\s+set(?:Query|Q)\]\s*=\s*useState\([^)]+\);\n?/g, '');
  }
  
  // Inject the CategorySearch import if missing
  if (!content.includes('import { CategorySearch }')) {
      const lastImportIndex = content.lastIndexOf('import ');
      content = content.replace(/import { Search(?:,\s*[\w]+)* } from "lucide-react";\s*/, (match) => {
          // Keep other lucide imports if any exist in that line!
          const otherImports = match.replace('Search', '').replace(/,\s*,/, ',').replace(/import \{\s*,\s*/, 'import { ').replace(/,\s*\}/, ' }');
          if (otherImports.includes('{  }')) return ''; // it was just search
          return otherImports;
      });
      content = `import { CategorySearch } from "@/components/CategorySearch";\n` + content;
  }
  
  // If toolsVar is not imported, import it
  if (!content.includes(toolsVar)) {
     content = `import { ${toolsVar} } from "${mapConfig.import}";\n` + content;
  }
  
  // Replace the search bar
  const replacement = '<CategorySearch categorySlug="' + cat + '" placeholder="' + placeholder + '" registry={' + mapLogic + '} />';
  content = content.replace(searchBarRegex, replacement);
  
  // Counts
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
  successful.push({ cat, file: fileToCheck });
}

fs.writeFileSync('scratch/search_fix_report.json', JSON.stringify({ successful, failed }, null, 2));
