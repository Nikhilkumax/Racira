const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(srcDir, 'app');
const domainsDir = path.join(srcDir, 'domains');

const categories = [
  '3d', 'animator', 'audio', 'business', 'cad', 'calculator', 'colors', 'crypto',
  'design', 'developers', 'education', 'engineering', 'finance', 'fitness',
  'flowchart', 'games', 'image', 'insight', 'maps', 'music', 'pdf', 'photo',
  'presentation', 'productivity', 'security', 'seo', 'travel', 'typography',
  'video', 'voice', 'writing'
];

let result = '| Category | Uses Shared Header? | Icon Match? | Right-Nav Match? |\n| --- | --- | --- | --- |\n';

function findHeader(cat) {
  // We check app/[cat], domains/[cat], and common components
  let searchDirs = [
    path.join(appDir, cat),
    path.join(domainsDir, cat, 'components'),
    path.join(srcDir, 'components', cat)
  ];
  if (cat === 'pdf') {
      searchDirs.push(path.join(appDir, 'pdf'));
  }

  let foundHeaderStr = null;
  let usesShared = false;

  for (let dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    for (let f of files) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      if (/<Header[\s>]/i.test(content)) {
        usesShared = true;
      }
      
      const match = content.match(/<header[^>]*>.*?<\/header>/is);
      if (match) {
        foundHeaderStr = match[0];
      }
    }
  }
  
  return { usesShared, foundHeaderStr };
}

for (const cat of categories) {
  const { usesShared, foundHeaderStr } = findHeader(cat);
  
  if (usesShared) {
     result += \| \ | Yes | Yes (Shared) | Yes (Shared) |\\n\;
  } else if (foundHeaderStr) {
     const hasSpecificIcon = /lucide-react/i.test(foundHeaderStr) || /<[A-Z][A-Za-z]+Icon/.test(foundHeaderStr);
     const hasRaciraLogo = /<svg/i.test(foundHeaderStr) || /Logo/i.test(foundHeaderStr) || /clover/i.test(foundHeaderStr);
     
     let iconMatch = hasSpecificIcon ? 'No (Category Icon)' : (hasRaciraLogo ? 'No (Inline SVG/Logo)' : 'No (Unknown)');
     
     const hasExploreTools = /Explore Tools/i.test(foundHeaderStr);
     const hasModeToggle = /ModeToggle/i.test(foundHeaderStr);
     const hasToolCount = /tools|calculators|templates/i.test(foundHeaderStr) && /\\d+/.test(foundHeaderStr);
     const hasExtraLinks = /About/i.test(foundHeaderStr) || />\\s*Tools\\s*</i.test(foundHeaderStr);
     
     let navIssues = [];
     if (!hasExploreTools) navIssues.push('No Explore Tools');
     if (hasToolCount) navIssues.push('Has tool count');
     if (hasExtraLinks) navIssues.push('Has extra links');
     if (!hasModeToggle) navIssues.push('No ModeToggle');
     
     let rightNavMatch = navIssues.length === 0 ? 'Match' : navIssues.join(', ');
     result += \| \ | No | \ | \ |\\n\;
  } else {
     // fallback if we missed the header
     result += \| \ | No | No header found | No header found |\\n\;
  }
}

console.log(result);
