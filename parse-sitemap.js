const fs = require('fs');
const content = fs.readFileSync('src/lib/sitemap/sitemapSources.ts', 'utf8');

const regex = /loc:\s*`\$\{baseUrl\}\/([a-z0-9-]+)\/([a-z0-9-]+)`/g;
let matches;
const domains = {};
while ((matches = regex.exec(content)) !== null) {
  const domain = matches[1];
  const tool = matches[2];
  if (!domains[domain]) {
    domains[domain] = [];
  }
  domains[domain].push(tool);
}
console.log(domains);
