const fs = require('fs');
const glob = require('glob');
const lucide = require('lucide-react');

const allCanonicalIcons = Object.keys(lucide).filter(k => 
  (typeof lucide[k] === 'object' || typeof lucide[k] === 'function') &&
  !k.endsWith('Icon') && !k.startsWith('Lucide')
);

const bad = new Set(['CreditCard', 'Bitcoin', 'ActivitySquare', 'Angry', 'Annoyed', 'Banknote', 'Battery', 'Beaker', 'Bean', 'Bell', 'Bike', 'Accessibility', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmCheck', 'Aa', 'Compass', 'createLucideIcon', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
let goodIcons = allCanonicalIcons.filter(i => !bad.has(i) && !i.includes('Arrow') && !i.includes('Circle') && !i.includes('Square') && !i.includes('Octagon') && !i.includes('Triangle'));

const files = [
  ...glob.sync('src/domains/*/registry.ts'),
  ...glob.sync('src/data/*/tools.ts')
];

function getSemanticIcon(toolName, availableIcons) {
  let kw = [];
  const n = toolName.toLowerCase();
  
  // Dev & Code
  if (n.includes('json') || n.includes('object')) kw.push('braces', 'brackets', 'filejson', 'curly');
  if (n.includes('xml') || n.includes('html') || n.includes('markup') || n.includes('tag')) kw.push('code', 'filecode', 'terminal', 'layout', 'bracket');
  if (n.includes('sql') || n.includes('data') || n.includes('base') || n.includes('query')) kw.push('database', 'server', 'table', 'harddrive');
  if (n.includes('regex') || n.includes('expression')) kw.push('regex', 'search', 'text', 'type');
  if (n.includes('css') || n.includes('style') || n.includes('color')) kw.push('palette', 'brush', 'paint', 'droplet', 'layout');
  if (n.includes('js') || n.includes('javascript') || n.includes('typescript')) kw.push('filetype', 'terminal', 'filecode');
  if (n.includes('format') || n.includes('beautify') || n.includes('minif') || n.includes('lint')) kw.push('wand', 'sparkles', 'check', 'align', 'magic');
  
  // Web & Net
  if (n.includes('url') || n.includes('uri') || n.includes('link') || n.includes('href')) kw.push('link', 'globe', 'mousepointer', 'external');
  if (n.includes('http') || n.includes('header') || n.includes('api') || n.includes('rest') || n.includes('fetch')) kw.push('network', 'cloud', 'server', 'plug', 'zap');
  if (n.includes('ip') || n.includes('dns') || n.includes('subnet') || n.includes('port')) kw.push('globe', 'router', 'wifi', 'network');
  
  // Security
  if (n.includes('hash') || n.includes('crypto') || n.includes('sha') || n.includes('md5') || n.includes('encode') || n.includes('decode') || n.includes('base64')) kw.push('lock', 'shield', 'key', 'fingerprint', 'binary', 'hash');
  if (n.includes('password') || n.includes('secret') || n.includes('auth')) kw.push('key', 'lock', 'shield', 'eye');
  
  // Text & String
  if (n.includes('text') || n.includes('string') || n.includes('word') || n.includes('case') || n.includes('lorem')) kw.push('type', 'filetext', 'align', 'pilcrow', 'heading', 'font');
  if (n.includes('markdown') || n.includes('md')) kw.push('book', 'filetext', 'heading');
  
  // SEO
  if (n.includes('seo') || n.includes('meta') || n.includes('rank') || n.includes('serp')) kw.push('search', 'linechart', 'bar', 'trending', 'gauge', 'target');
  if (n.includes('competitor') || n.includes('gap')) kw.push('split', 'gitcompare', 'diff', 'scale');
  if (n.includes('sitemap') || n.includes('robot')) kw.push('map', 'bot', 'route', 'gitbranch');
  if (n.includes('mobile') || n.includes('amp') || n.includes('responsive')) kw.push('smartphone', 'tablet', 'monitor', 'laptop');
  
  // Media & Image
  if (n.includes('image') || n.includes('photo') || n.includes('webp') || n.includes('png') || n.includes('jpg')) kw.push('image', 'camera', 'picture', 'aperture');
  
  // Tools & Utils
  if (n.includes('convert') || n.includes('↔')) kw.push('refresh', 'replace', 'arrowrightleft', 'repeat');
  if (n.includes('generat') || n.includes('build') || n.includes('creat')) kw.push('plus', 'wand', 'hammer', 'anvil', 'factory');
  if (n.includes('calculat') || n.includes('count') || n.includes('size') || n.includes('length')) kw.push('calculator', 'ruler', 'scale', 'tally');
  if (n.includes('validat') || n.includes('check') || n.includes('test')) kw.push('check', 'shieldcheck', 'badgecheck');
  if (n.includes('visualiz') || n.includes('preview')) kw.push('eye', 'monitor', 'gantt', 'chart');
  
  // Fallback defaults for developer tools
  kw.push('cpu', 'chip', 'code', 'file', 'laptop', 'monitor', 'keyboard', 'mouse', 'cog', 'settings', 'sliders');

  for (const k of kw) {
    for (const icon of availableIcons) {
      if (icon.toLowerCase().includes(k)) {
        return icon;
      }
    }
  }
  
  // Last resort: pick a generic tech icon if possible
  const techFallback = availableIcons.find(i => /file|code|cog|tool|box|layer/i.test(i));
  return techFallback || availableIcons[0];
}

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  let iconsList = [...goodIcons];
  
  const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/s);
  if (!importMatch) continue;
  
  const usedIcons = importMatch[1].split(',')
    .map(i => i.trim().split(/\s+as\s+/)[0])
    .filter(i => i.length > 0 && i !== 'LucideIcon' && i !== 'createLucideIcon' && i !== 'inferIcon');
    
  const seenStripped = new Set();
  const replacements = [];
  
  for (const icon of usedIcons) {
    let stripped = icon.replace(/^Lucide/, '').replace(/Icon$/, '');
    
    if (seenStripped.has(stripped)) {
      const toolMatch = code.match(new RegExp(`\\["([^"]+)",\\s*${icon}\\b`, 'i')) || 
                        code.match(new RegExp(`\\["([^"]+)",[^,]+,\\s*${icon}\\b`, 'i')) || 
                        code.match(new RegExp(`name:\\s*"([^"]+)".*?icon:\\s*${icon}\\b`, 'is'));
      
      const toolName = toolMatch ? toolMatch[1] : '';
      
      const available = iconsList.filter(i => !seenStripped.has(i));
      const fresh = getSemanticIcon(toolName, available);
      
      replacements.push({ old: icon, new: fresh, toolName });
      seenStripped.add(fresh);
    } else if (icon !== stripped) {
      seenStripped.add(stripped);
      replacements.push({ old: icon, new: stripped, toolName: 'ALIAS' });
    } else {
      seenStripped.add(stripped);
    }
  }

  if (replacements.length > 0) {
    for (const {old, new: newIcon} of replacements) {
      code = code.replace(new RegExp(`\\b${old}\\b`, 'g'), newIcon);
    }
    
    const newImports = Array.from(seenStripped).sort();
    
    // Fix SEO Map conflict
    if (file.includes('seo') && newImports.includes('Map')) {
        newImports.splice(newImports.indexOf('Map'), 1);
        newImports.push('Map as MapIcon');
        code = code.replace(/icon:\s*Map\b/g, 'icon: MapIcon');
        code = code.replace(/,\s*Map\s*\]/g, ', MapIcon]');
    }
    
    code = code.replace(/import\s+\{[^}]+\}\s+from\s+["']lucide-react["']/s, `import { ${newImports.join(', ')} } from "lucide-react"`);
    
    fs.writeFileSync(file, code);
  }
}
