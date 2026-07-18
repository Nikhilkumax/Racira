import fs from 'fs';
import path from 'path';

const toSlug = (text: string) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/&/g, '') // remove &
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // double hyphens to single
    .replace(/^-|-$/g, ''); // trim hyphens
};

const domainsDir = path.join(process.cwd(), 'src/domains');
const dataDir = path.join(process.cwd(), 'src/data');

const getRegistries = () => {
  let files: { domain: string, file: string }[] = [];
  
  if (fs.existsSync(domainsDir)) {
    const domains = fs.readdirSync(domainsDir).filter(d => fs.statSync(path.join(domainsDir, d)).isDirectory());
    for (const d of domains) {
      const regPath = path.join(domainsDir, d, 'registry.ts');
      if (fs.existsSync(regPath)) {
        files.push({ domain: d, file: regPath });
      }
    }
  }

  if (fs.existsSync(dataDir)) {
    const dataDomains = fs.readdirSync(dataDir).filter(d => fs.statSync(path.join(dataDir, d)).isDirectory());
    for (const d of dataDomains) {
      let regPath = path.join(dataDir, d, 'tools.ts');
      if (!fs.existsSync(regPath)) {
        regPath = path.join(dataDir, d, `${d}.ts`);
      }
      if (fs.existsSync(regPath)) {
        files.push({ domain: d, file: regPath });
      }
    }
  }
  return files;
}

const run = async () => {
  const registries = getRegistries();
  
  const results: { domain: string, type: string, original: string, slug: string }[] = [];
  const flags: { domain: string, type: string, original: string, slug: string, reason: string }[] = [];

  for (const { domain, file } of registries) {
    try {
      const module = await import(`file://${file.replace(/\\/g, '/')}`);
      let registry = module.SEARCH_REGISTRY || module.default?.SEARCH_REGISTRY || module.calculatorRegistry || module.audioRegistry || module.gamesRegistry || module.TOOLS || module.tools || module.ALL_TOOLS;
      
      let cats: any[] = [];
      if (!registry && module.categories) {
        cats = module.categories;
        registry = module.categories.flatMap((c: any) => c.tools.map((t: any) => ({ ...t, category: c.name })));
      } else if (!registry && module.CATEGORIES) {
        cats = module.CATEGORIES;
        registry = module.CATEGORIES.flatMap((c: any) => c.tools.map((t: any) => ({ ...t, category: c.name })));
      }

      const categories = new Set<string>();
      const subcategories = new Set<string>();

      if (registry) {
        for (const item of registry) {
          if (item.category) categories.add(item.category);
          if (item.subcategory) subcategories.add(item.subcategory);
        }
      }

      // If the domain export explicit categories, add them too
      if (cats && cats.length > 0) {
        for (const c of cats) {
          categories.add(c.name || c.category);
          if (c.subcategories) {
            for (const sub of c.subcategories) {
              subcategories.add(sub.name);
            }
          }
        }
      }

      for (const c of categories) {
        if (!c) continue;
        const slug = toSlug(c);
        results.push({ domain, type: 'Category', original: c, slug });
      }
      for (const s of subcategories) {
        if (!s) continue;
        const slug = toSlug(s);
        results.push({ domain, type: 'Subcategory', original: s, slug });
      }

    } catch (e) {
      console.error(`Error processing ${domain}:`, e);
    }
  }

  // Find flags
  for (const r of results) {
    const { original, slug } = r;
    let reason = '';
    if (original.includes('&') && !original.toLowerCase().includes('and') && !slug.includes('and')) {
      reason = '& dropped silently without replacement';
    } else if (original.includes('+') && !slug.includes('plus')) {
      reason = '+ dropped silently';
    } else if (original.includes('/') && slug.replace(/-/g, '').length < original.replace(/[^a-zA-Z0-9]/g, '').length) {
      reason = '/ caused character loss or unexpected join';
    }
    
    // Also flag if two distinct words were collapsed together (e.g. A/B -> ab instead of a-b)
    if (original.match(/[a-zA-Z]\/[a-zA-Z]/)) {
      if (!slug.match(/[a-z]-[a-z]/)) {
        reason = '/ caused word collapse';
      }
    }

    if (reason) {
      flags.push({ ...r, reason });
    }
  }

  let output = `# Slug Dry-Run Table\n\n`;
  output += `## Flagged Items\n\n`;
  if (flags.length === 0) {
    output += `*No flagged items found!*\n\n`;
  } else {
    output += `| Domain | Type | Original Name | Generated Slug | Reason / Issue |\n`;
    output += `|---|---|---|---|---|\n`;
    for (const f of flags) {
      output += `| ${f.domain} | ${f.type} | \`${f.original}\` | \`${f.slug}\` | ${f.reason} |\n`;
    }
    output += `\n`;
  }

  output += `## Full Table\n\n`;
  output += `| Domain | Type | Original Name | Generated Slug |\n`;
  output += `|---|---|---|---|\n`;
  for (const r of results) {
    output += `| ${r.domain} | ${r.type} | \`${r.original}\` | \`${r.slug}\` |\n`;
  }

  fs.writeFileSync('C:\\Users\\nikhi\\.gemini\\antigravity\\scratch\\slug_dryrun_output.md', output, 'utf8');
}

run();
