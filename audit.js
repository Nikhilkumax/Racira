const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'src', 'app');
const categories = [
  '3d', 'animator', 'audio', 'business', 'cad', 'calculator', 'colors', 'crypto',
  'design', 'developers', 'education', 'engineering', 'finance', 'fitness',
  'flowchart', 'games', 'image', 'insight', 'maps', 'music', 'pdf', 'photo',
  'presentation', 'productivity', 'security', 'seo', 'travel', 'typography',
  'video', 'voice', 'writing'
];

let result = '| Category | Uses Shared Header? | Icon Match? | Right-Nav Match? |\n| --- | --- | --- | --- |\n';

for (const cat of categories) {
  const layoutPath = path.join(appsDir, cat, 'layout.tsx');
  const pagePath = path.join(appsDir, cat, 'page.tsx');
  
  let content = '';
  if (fs.existsSync(layoutPath)) {
    content += fs.readFileSync(layoutPath, 'utf8');
  }
  if (fs.existsSync(pagePath)) {
    content += fs.readFileSync(pagePath, 'utf8');
  }

  const usesSharedHeader = /<Header[\s>]/i.test(content) || /import Header from/i.test(content);
  
  let iconMatch = 'N/A';
  let rightNavMatch = 'N/A';

  if (!usesSharedHeader) {
    if (content.includes('header')) {
        // extract the header part
        const headerMatch = content.match(/<header.*?<\/header>/is);
        if (headerMatch) {
            const headerStr = headerMatch[0];
            const hasSpecificIcon = /lucide-react/i.test(content) && /<[A-Z][A-Za-z]+Icon/.test(headerStr);
            const hasRaciraIcon = /<svg/i.test(headerStr);
            
            iconMatch = hasSpecificIcon ? 'No (Category Icon)' : (hasRaciraIcon ? 'Maybe (Custom SVG)' : 'No (Unknown)');
            
            const hasExploreTools = /Explore Tools/i.test(headerStr);
            const hasModeToggle = /ModeToggle/i.test(content);
            const hasToolCount = /tools|calculators|templates/i.test(headerStr) && /\d+/.test(headerStr);
            const hasExtraLinks = /About/i.test(headerStr) || />\s*Tools\s*</i.test(headerStr) || />\s*Home\s*</i.test(headerStr);
            
            let navIssues = [];
            if (!hasExploreTools) navIssues.push('No Explore Tools button');
            if (hasToolCount) navIssues.push('Has tool count');
            if (hasExtraLinks) navIssues.push('Has extra links');
            if (!hasModeToggle) navIssues.push('No ModeToggle');
            
            rightNavMatch = navIssues.length === 0 ? 'Match' : navIssues.join(', ');
        } else {
            iconMatch = 'No header tag found';
            rightNavMatch = 'No header tag found';
        }
    } else {
        iconMatch = 'No header';
        rightNavMatch = 'No header';
    }
    result += `| ${cat} | No | ${iconMatch} | ${rightNavMatch} |\n`;
  } else {
    // If it uses shared header, we assume it's correct per the instruction
    result += `| ${cat} | Yes | Yes (Shared) | Yes (Shared) |\n`;
  }
}
console.log(result);
