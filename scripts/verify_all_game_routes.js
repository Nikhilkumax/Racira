const http = require('http');
const { CATEGORIES } = require('../src/data/games/games');

function slugify(name) {
  return name.toLowerCase().replace(/['"']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fetchStatus(path) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 3002, path, method: 'HEAD' };
    const req = http.request(opts, (res) => resolve({ path, status: res.statusCode }));
    req.on('error', () => resolve({ path, status: 'ERR' }));
    req.end();
  });
}

async function main() {
  const routes = ['/games'];
  CATEGORIES.forEach(cat => {
    const catSlug = slugify(cat.name);
    cat.subcategories.forEach(sub => {
      routes.push(`/games/${catSlug}/${slugify(sub.name)}`);
    });
  });

  // Check all 84 (1 index + 83 subcategories)
  const results = await Promise.all(routes.map(fetchStatus));

  const ok = results.filter(r => r.status === 200);
  const bad = results.filter(r => r.status !== 200);

  console.log(`Total routes checked: ${results.length}`);
  console.log(`200 OK: ${ok.length}`);
  console.log(`Non-200: ${bad.length}`);
  if (bad.length > 0) {
    console.log('\nFailing routes:');
    bad.forEach(r => console.log(`  ${r.status}  ${r.path}`));
  }

  // DOM sample: fetch 5 game cards from one subcategory page
  console.log('\n=== DOM SAMPLE: /games/puzzle-games/number-puzzles (5 game cards) ===');
  const domReq = await new Promise((resolve) => {
    http.get('http://localhost:3002/games/puzzle-games/number-puzzles', (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    });
  });

  // Extract game card titles and Coming Soon badges
  const cardMatches = [...domReq.matchAll(/<h3[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([^<]+)<\/h3>/g)];
  const badges = [...domReq.matchAll(/Coming Soon/g)];
  console.log(`Game card titles found: ${cardMatches.length}`);
  console.log(`"Coming Soon" badges found: ${badges.length}`);
  cardMatches.slice(0, 5).forEach((m, i) => console.log(`  Card ${i+1}: title="${m[1].trim()}"`));
}

main();
