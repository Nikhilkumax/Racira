import fs from 'fs';
import { CATEGORIES } from '../src/data/games/games';
import * as lucide from 'lucide-react';

const allCanonicalIcons = Object.keys(lucide).filter(k => 
  (typeof (lucide as any)[k] === 'object' || typeof (lucide as any)[k] === 'function') &&
  !k.endsWith('Icon') && !k.startsWith('Lucide')
);

const bad = new Set(['CreditCard', 'Bitcoin', 'ActivitySquare', 'Angry', 'Annoyed', 'Banknote', 'Battery', 'Beaker', 'Bean', 'Bell', 'Bike', 'Accessibility', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmCheck', 'Aa', 'Compass', 'createLucideIcon', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);
let goodIcons = allCanonicalIcons.filter(i => !bad.has(i) && !i.includes('Arrow') && !i.includes('Circle') && !i.includes('Square') && !i.includes('Octagon') && !i.includes('Triangle'));

function getSemanticIcon(toolName: string, availableIcons: string[]) {
  let kw: string[] = [];
  const n = toolName.toLowerCase();
  
  if (n.includes('number') || n.includes('math')) kw.push('hash', 'binary', 'calculator', 'sigma');
  if (n.includes('logic') || n.includes('puzzle') || n.includes('brain')) kw.push('brain', 'lightbulb', 'puzzle', 'cog');
  if (n.includes('word') || n.includes('text') || n.includes('typing')) kw.push('type', 'filetext', 'keyboard', 'book');
  if (n.includes('card') || n.includes('casino')) kw.push('spade', 'club', 'heart', 'diamond', 'dice');
  if (n.includes('board') || n.includes('chess') || n.includes('strategy')) kw.push('crown', 'castle', 'swords', 'shield');
  if (n.includes('arcade') || n.includes('action') || n.includes('platformer')) kw.push('gamepad', 'joystick', 'rocket', 'zap');
  if (n.includes('idle') || n.includes('clicker')) kw.push('mousepointer', 'cursor', 'hand', 'clock');
  if (n.includes('simulat') || n.includes('build')) kw.push('factory', 'building', 'home', 'truck');
  if (n.includes('quiz') || n.includes('trivia')) kw.push('helpcircle', 'question', 'graduation');
  if (n.includes('memory')) kw.push('brain', 'eye', 'search');
  if (n.includes('draw') || n.includes('creative') || n.includes('art')) kw.push('palette', 'brush', 'paint', 'pen');
  if (n.includes('educat') || n.includes('science')) kw.push('flask', 'atom', 'telescope', 'book');
  if (n.includes('speed') || n.includes('reflex')) kw.push('zap', 'timer', 'fastforward', 'flame');
  if (n.includes('relax') || n.includes('ambient')) kw.push('waves', 'wind', 'leaf', 'cloud');

  for (const k of kw) {
    for (const icon of availableIcons) {
      if (icon.toLowerCase().includes(k)) {
        return icon;
      }
    }
  }
  
  const techFallback = availableIcons.find(i => /star|play|trophy|flag|target/i.test(i));
  return techFallback || availableIcons[0];
}

const existingIcons = [
  'Puzzle', 'Type', 'Calculator', 'Spade', 'Crown', 'Gamepad2', 'Castle', 'MousePointerClick', 'Factory', 'HelpCircle', 'Brain', 'Keyboard', 'Palette', 'GraduationCap', 'Dice5', 'Zap', 'Waves', 'Sparkles'
];
let available = goodIcons.filter(i => !existingIcons.includes(i));
const used = new Set(existingIcons);

let tsContent = `import { ToolResult } from "@/components/CategorySearch";\nimport {\n  type LucideIcon,\n`;
existingIcons.forEach(i => tsContent += `  ${i},\n`);

const newCategories = CATEGORIES.map(cat => {
    return {
        name: cat.name,
        icon: cat.name === 'Word Games' ? 'Type' : existingIcons.find(i => cat.name.includes(i)) || 'Puzzle',
        subcategories: Object.entries(cat.subcategories).map(([subName, gamesList]) => {
            const icon = getSemanticIcon(subName, available);
            available = available.filter(i => i !== icon);
            used.add(icon);
            return {
                name: subName,
                icon,
                games: gamesList
            };
        })
    };
});

Array.from(used).filter(i => !existingIcons.includes(i)).sort().forEach(i => tsContent += `  ${i},\n`);
tsContent += `} from "lucide-react";\n\n`;

tsContent += `export type GameSubcategory = {
  name: string;
  icon: LucideIcon;
  games: string[];
};

export type GameCategory = {
  name: string;
  icon: LucideIcon;
  subcategories: GameSubcategory[];
};

export type Game = {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  icon: LucideIcon;
};

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/['"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CATEGORIES: GameCategory[] = [\n`;

newCategories.forEach(cat => {
    tsContent += `  {\n    name: ${JSON.stringify(cat.name)},\n    icon: ${cat.icon},\n    subcategories: [\n`;
    
    cat.subcategories.forEach(sub => {
        tsContent += `      {\n        name: ${JSON.stringify(sub.name)},\n        icon: ${sub.icon},\n        games: [\n`;
        (sub.games as unknown as string[]).forEach((g: string) => {
            tsContent += `          ${JSON.stringify(g)},\n`;
        });
        tsContent += `        ]\n      },\n`;
    });
    tsContent += `    ]\n  },\n`;
});
tsContent += `];\n\n`;

tsContent += `
export const getAllGames = (): Game[] =>
  CATEGORIES.flatMap((cat) =>
    cat.subcategories.flatMap((sub) =>
      sub.games.map((title) => ({
        slug: slugify(title),
        title,
        category: cat.name,
        subcategory: sub.name,
        icon: sub.icon,
      }))
    )
  );

export const getCategories = (): GameCategory[] => CATEGORIES;

export const getGamesByCategory = (categoryName: string): Game[] => {
  const cat = CATEGORIES.find((c) => c.name === categoryName);
  if (!cat) return [];
  return cat.subcategories.flatMap(sub => 
      sub.games.map(title => ({
        slug: slugify(title),
        title,
        category: cat.name,
        subcategory: sub.name,
        icon: sub.icon,
      }))
  );
};

export const SEARCH_REGISTRY: ToolResult[] = CATEGORIES.flatMap((cat) =>
  cat.subcategories.flatMap(sub => 
    sub.games.map(title => ({
      name: title,
      description: \`A \${sub.name.toLowerCase()} game\`,
      slug: slugify(title),
      href: \`/games/game/\${slugify(title)}\`,
      category: cat.name,
      isBuilt: false,
    }))
  )
);

export const searchGames = (query: string): Game[] => {
  const q = query.trim().toLowerCase();
  if (!q) return getAllGames();
  return getAllGames().filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.subcategory.toLowerCase().includes(q)
  );
};

export const getTotalGameCount = (): number => getAllGames().length;
`;

const catIcons: Record<string, string> = {
    "Puzzle Games": "Puzzle",
    "Word Games": "Type",
    "Math & Number Games": "Calculator",
    "Card Games": "Spade",
    "Board & Classic Games": "Crown",
    "Arcade & Action Games": "Gamepad2",
    "Strategy & Tower Defense": "Castle",
    "Idle & Clicker Games": "MousePointerClick",
    "Simulation Games": "Factory",
    "Quiz & Trivia Games": "HelpCircle",
    "Memory & Brain Games": "Brain",
    "Typing Games": "Keyboard",
    "Drawing & Creative Games": "Palette",
    "Educational Games": "GraduationCap",
    "Casino-Style Games (No Real Money)": "Dice5",
    "Reflex & Speed Games": "Zap",
    "Ambient & Relaxing Games": "Waves",
    "Experimental & Misc Games": "Sparkles"
};
for(const [name, icon] of Object.entries(catIcons)) {
    tsContent = tsContent.replace(new RegExp(`name: "${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\n    icon: .*?,`), `name: "${name}",\n    icon: ${icon},`);
}


fs.writeFileSync('src/data/games/games.ts', tsContent);
console.log('Successfully refactored games.ts via tsx!');
