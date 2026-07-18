// @ts-nocheck
const http = require('http');

// 1. ICON COUNT RECONCILIATION
const { CATEGORIES } = require('../src/data/games/games');
const catIcons = new Set();
const subIcons = new Set();

CATEGORIES.forEach((cat: any) => {
  catIcons.add(cat.icon.displayName || cat.icon.name || String(cat.icon));
  cat.subcategories.forEach((sub: any) => {
    subIcons.add(sub.icon.displayName || sub.icon.name || String(sub.icon));
  });
});

console.log('=== ICON COUNT RECONCILIATION ===');
console.log(`Category-level icons:    18 categories => ${catIcons.size} unique icons`);
console.log(`Subcategory-level icons: ${CATEGORIES.reduce((acc: any, c: any) => acc + c.subcategories.length, 0)} subcategories => ${subIcons.size} unique icons`);
const allIcons = new Set([...catIcons, ...subIcons]);
console.log(`Union (cat + subcat):    ${allIcons.size} total unique icons across the full file`);
console.log('');
console.log('Category icons used:', Array.from(catIcons).sort().join(', '));
console.log('');

// 2. DESCRIPTION UNIQUENESS CHECK
const allGames = CATEGORIES.flatMap((cat: any) =>
  cat.subcategories.flatMap((sub: any) =>
    sub.games.map((title: any) => ({
      title,
      description: `A ${sub.name.toLowerCase()} game`,
      category: cat.name,
      subcategory: sub.name,
    }))
  )
);

const descCounts: any = {};
allGames.forEach((g: any) => {
  descCounts[g.description] = (descCounts[g.description] || 0) + 1;
});

const totalGames = allGames.length;
const uniqueDescs = Object.keys(descCounts).length;
const toolsWithDupeDesc = Object.entries(descCounts).filter(([, count]: any) => count > 1);
const totalWithDupe = toolsWithDupeDesc.reduce((acc: any, [, c]: any) => acc + c, 0);

console.log('=== DESCRIPTION UNIQUENESS CHECK ===');
console.log(`Total games:             ${totalGames}`);
console.log(`Unique descriptions:     ${uniqueDescs}`);
console.log(`Tools with shared desc:  ${totalWithDupe} of ${totalGames} (${Math.round(totalWithDupe / totalGames * 100)}%)`);
console.log('');
console.log('Top 10 most-shared descriptions:');
toolsWithDupeDesc
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([desc, count]: any) => console.log(`  "${desc}" => ${count} tools`));