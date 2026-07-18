const fs = require('fs');

const domains = ["travel", "typography", "video", "voice", "writing"];

domains.forEach(d => {
  const p = fs.existsSync(`src/domains/${d}/registry.ts`) ? `src/domains/${d}/registry.ts` : `src/data/${d}/tools.ts`;
  if (!fs.existsSync(p)) return;
  const c = fs.readFileSync(p, 'utf8');
  
  // match array of arrays pattern: ["Tool Name", "Desc", icon, false]
  let match = c.match(/\[\s*["']([^"']+)["'],\s*["']/);
  if (match) {
    console.log(`${d} tool: ${match[1]}`);
  }
  
  // match category name
  let catMatch = c.match(/category:\s*["']([^"']+)["']/);
  if (catMatch) {
    console.log(`${d} category: ${catMatch[1]}`);
  }
});
