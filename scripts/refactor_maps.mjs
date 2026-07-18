import fs from 'fs';
import path from 'path';

const file = 'c:\\Racira\\racira-nextjs\\src\\domains\\maps\\registry.ts';
let content = fs.readFileSync(file, 'utf-8');

// Replace Tool type
content = content.replace(
  'export type Tool = { name: string; desc: string; icon: React.ComponentType<{ className?: string }> };',
  'import { Tool as BaseTool } from "@/domains/_types";\nexport type Tool = BaseTool;'
);

// We need to replace `{ name: "...", desc: "...", icon: ... }` with `{ name: "...", slug: "...", description: "...", icon: ..., status: "soon" }`
content = content.replace(/{ name: "([^"]+)", desc: "([^"]+)", icon: ([^}]+) }/g, (match, name, desc, icon) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `{ name: "${name}", slug: "${slug}", description: "${desc}", icon: ${icon}, status: "soon" }`;
});

// Add SEARCH_REGISTRY
if (!content.includes('SEARCH_REGISTRY')) {
  content += `\n
export const SEARCH_REGISTRY = sections.flatMap((sec) =>
  sec.tools.map((t) => ({
    name: t.name,
    description: t.description,
    slug: t.slug,
    href: \`/maps/tool/\${t.slug}\`,
    category: "Maps & GIS",
    isBuilt: t.status === "live",
  }))
);\n`;
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Done refactoring registry.ts');
