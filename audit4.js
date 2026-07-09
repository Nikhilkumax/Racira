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

let result = '| Category | Landing Page Header Source | Tool-Detail Page Header Source |\n| --- | --- | --- |\n';

function inspectHeader(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasShadow = /function Header\(|const Header =/.test(content);
  const hasInlineHeader = /<header[^>]*>/.test(content);
  const hasImport = /import Header from/i.test(content);
  const usesHeader = /<Header[\s>]/.test(content);
  
  if (hasShadow) return 'Local Shadow (`function Header()`)';
  if (hasInlineHeader) return 'Local Inline (`<header>`)';
  if (hasImport && usesHeader) return 'Shared Import';
  if (usesHeader && !hasImport) return 'Local Shadow (Imported elsewhere/Unknown)';
  
  return null;
}

function findLandingHeader(cat) {
  // Check layout.tsx, page.tsx, and then known component shells
  const paths = [
    path.join(appDir, cat, 'layout.tsx'),
    path.join(appDir, cat, 'page.tsx'),
    path.join(domainsDir, cat, 'components', 'SiteShell.tsx'),
    path.join(domainsDir, cat, 'components', 'Layout.tsx'),
    path.join(domainsDir, cat, 'components', 'site-chrome.tsx'),
    path.join(domainsDir, cat, 'components', 'HeaderFooter.tsx'),
    path.join(domainsDir, cat, 'components', 'SiteHeader.tsx'),
    path.join(domainsDir, cat, 'blog', 'page-shell.tsx'),
    path.join(appDir, 'pdf', 'ClientLayout.tsx')
  ];
  
  for (const p of paths) {
    const res = inspectHeader(p);
    if (res) return res;
  }
  return 'No Header Found';
}

function findToolHeader(cat) {
  // Check tool/[slug]/page.tsx or tools/[slug]/page.tsx
  const paths = [
    path.join(appDir, cat, 'tool', '[slug]', 'page.tsx'),
    path.join(appDir, cat, 'tools', '[slug]', 'page.tsx'),
    path.join(appDir, cat, 'tools', 'swot-analysis-builder', 'page.tsx'), // special case
    path.join(appDir, cat, 'tools', 'deep-work-session-planner', 'page.tsx'), // special case
    path.join(appDir, cat, 'tools', 'audio-conversion', 'mp3-converter', 'page.tsx') // special case
  ];
  
  for (const p of paths) {
    const res = inspectHeader(p);
    if (res) return res;
  }
  
  // If no specific route exists, say No Header/Route
  return 'No Tool-Detail Page / No Header';
}

for (const cat of categories) {
  const landing = findLandingHeader(cat);
  const tool = findToolHeader(cat);
  result += `| ${cat} | ${landing} | ${tool} |\n`;
}

console.log(result);
