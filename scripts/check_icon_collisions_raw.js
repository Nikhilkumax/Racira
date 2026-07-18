// Read the raw source file and extract icon names from subcategory blocks
const fs = require('fs');
const code = fs.readFileSync('src/data/games/games.ts', 'utf8');

// Extract all subcategory icon assignments: `icon: SomeIconName,`
// within subcategory blocks
const subBlocks = code.split(/\{\s*name:/).slice(1); // skip first (category name)

const iconAssignments = [];
let inSubcategory = false;
let currentName = '';

// Parse line by line to match subcategory name + icon
const lines = code.split('\n');
let lastSubName = '';
lines.forEach(line => {
  const subNameMatch = line.match(/name:\s*"([^"]+)"/);
  const iconMatch = line.match(/icon:\s*([A-Za-z0-9]+),/);
  const gamesMatch = line.match(/games:\s*\[/);
  
  if (subNameMatch) lastSubName = subNameMatch[1];
  if (iconMatch && gamesMatch === null) {
    // This icon line is either a category or subcategory icon
    iconAssignments.push({ name: lastSubName, icon: iconMatch[1] });
  }
});

// Separate category-level (18 known) from subcategory-level (83 expected)
const categoryNames = [
  "Puzzle Games", "Word Games", "Math & Number Games", "Card Games",
  "Board & Classic Games", "Arcade & Action Games", "Strategy & Tower Defense",
  "Idle & Clicker Games", "Simulation Games", "Quiz & Trivia Games",
  "Memory & Brain Games", "Typing Games", "Drawing & Creative Games",
  "Educational Games", "Casino-Style Games (No Real Money)", "Reflex & Speed Games",
  "Ambient & Relaxing Games", "Experimental & Misc Games"
];

const categoryIcons = iconAssignments.filter(a => categoryNames.includes(a.name));
const subcategoryIcons = iconAssignments.filter(a => !categoryNames.includes(a.name));

console.log(`=== ICON COUNT RECONCILIATION (source-parsed) ===`);
console.log(`Category-level icon assignments:    ${categoryIcons.length} (expected 18)`);
console.log(`Subcategory-level icon assignments: ${subcategoryIcons.length} (expected 83)`);
console.log(`Category unique icons: ${new Set(categoryIcons.map(a => a.icon)).size}`);
console.log(`Subcategory unique icons: ${new Set(subcategoryIcons.map(a => a.icon)).size}`);
console.log(`Union: ${new Set([...categoryIcons, ...subcategoryIcons].map(a => a.icon)).size}`);

// Find collisions within subcategory level only
const iconToSubs = {};
subcategoryIcons.forEach(a => {
  if (!iconToSubs[a.icon]) iconToSubs[a.icon] = [];
  iconToSubs[a.icon].push(a.name);
});
const collisions = Object.entries(iconToSubs).filter(([, subs]) => subs.length > 1);
console.log(`\nSubcategory icon collisions: ${collisions.length}`);
collisions.forEach(([icon, subs]) => {
  console.log(`  "${icon}": ${subs.join(' | ')}`);
});
