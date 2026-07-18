const fs = require('fs');

const replacements = [
  {
    file: "src/domains/crypto/registry.ts",
    from: `export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nexport const slugify = toSlug;`
  },
  {
    file: "src/domains/insight/registry.ts",
    from: `export const slugify = (s: string) =>\n  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nexport const slugify = toSlug;`
  },
  {
    file: "src/data/games/games.ts",
    from: `export const slugify = (title: string): string =>\n  title\n    .toLowerCase()\n    .replace(/&/g, "and")\n    .replace(/[^a-z0-9]+/g, "-")\n    .replace(/^-+|-+$/g, "");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nexport const slugify = toSlug;`
  },
  {
    file: "src/domains/security/registry.ts",
    from: `const slugify = (s: string) =>\n  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nconst slugify = toSlug;`
  },
  {
    file: "src/data/video/tools.ts",
    from: `const slugify = (s: string) =>\n  s\n    .toLowerCase()\n    .replace(/&/g, "and")\n    .replace(/\\+/g, "plus")\n    .replace(/[^a-z0-9]+/g, "-")\n    .replace(/^-|-$/g, "");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nconst slugify = toSlug;`
  },
  {
    file: "src/domains/writing/registry.ts",
    from: `const slugify = (s: string) =>\n  s\n    .toLowerCase()\n    .replace(/&/g, "and")\n    .replace(/[^\\w\\s-]/g, "")\n    .trim()\n    .replace(/\\s+/g, "-");`,
    to: `import { toSlug } from "@/lib/utils/slug";\nconst slugify = toSlug;`
  }
];

for (const { file, from, to } of replacements) {
    if (!fs.existsSync(file)) continue;
    let c = fs.readFileSync(file, 'utf8');
    if (c.includes(from)) {
        fs.writeFileSync(file, c.replace(from, to));
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find target in ${file}`);
    }
}
