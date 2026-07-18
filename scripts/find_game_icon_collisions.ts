import { CATEGORIES } from '../src/data/games/games';

// Find icon collisions within subcategory level
const iconToSubs: Record<string, string[]> = {};

CATEGORIES.forEach(cat => {
  cat.subcategories.forEach(sub => {
    const iconName = (sub.icon as any).displayName || (sub.icon as any).name || String(sub.icon);
    if (!iconToSubs[iconName]) iconToSubs[iconName] = [];
    iconToSubs[iconName].push(`${cat.name} → ${sub.name}`);
  });
});

const collisions = Object.entries(iconToSubs).filter(([, subs]) => subs.length > 1);
console.log(`=== SUBCATEGORY ICON COLLISIONS ===`);
console.log(`Total subcategories: 83`);
console.log(`Unique icon names used: ${Object.keys(iconToSubs).length}`);
console.log(`Collisions (icon used by 2+ subcategories): ${collisions.length}`);
collisions.forEach(([icon, subs]) => {
  console.log(`\n  Icon "${icon}" used by ${subs.length} subcategories:`);
  subs.forEach(s => console.log(`    - ${s}`));
});
